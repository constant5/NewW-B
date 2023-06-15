// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019

var Article = require('../models/articles');
var Tags = require('../models/tags');
var Users = require('../models/users');
var async = require('async');
const validator= require('express-validator');
var login_controller = require('./loginController');
var express = require('express');
var passport = require('passport');
require('../config/passport')(passport)


var router = express.Router();

/* Helper functions for controller functions */

// get all tags that a user follows
function findTags(callback,user) {
    Tags.find({'tag': { $in: user.follows}})
    .sort([['tag', 'ascending']])
    .exec(callback);
};

// get all tags
function allTags(callback) {
    Tags.find({}, {tag:1})
    .sort([['tag', 'ascending']])
    .exec(callback)
}

// get a users favorites
function findFavorites(callback,user) {
    console.info("finding favorites");
    Article.find({'_id': { $in: user.favorites}},{title:1, })
    .exec(callback);
};

// get a users voted_on 
function findVotes(callback,user) {
    console.info("finding votes")
    Users.findOne({"_id":user._id},{"voted_on":1})
    .populate({path: 'voted_on.article', model: Article, select:'title'})
    .exec(callback) 
};

// get a useres commented_on
function findComments(callback,user) {
    console.info("finding comments")
    Article.find({_id: { $in: user.commented_on}},{title:1})
    .exec(callback);
};

// update a users details
function updateUser(callback, req){
    // console.info(req.body.f_name)
    // console.info(req.user._id.toString())
    Users.findOneAndUpdate({"_id":req.user._id.toString()},
                            {$set: {"f_name":req.body.f_name, 
                                   "l_name":req.body.l_name, 
                                   "email":req.body.email}},
                            {ReturnNewDocument: true})
                            .exec(callback);
};


// change a users password
function changePass(callback,req) {
    console.info(req.user._id)
    Users.findOne({"_id":req.user._id}).then(function(record){
        if (record.pw === req.body.old_pass) {
            if (req.body.new_pass1 === req.body.new_pass2) {
                return Users.findOneAndUpdate({u_id:req.user.u_id},{pw:req.body.new_pass1})
                       .exec(callback)
            }else{
                req.flash('pass_error','New passwords do not match');
            };
        }else{
            req.flash('pass_error','Old Password does not match');
        };
        callback()
    });
};

// change a users follows attribute
function changeSubs(callback, req, res) {
    var tag_list = [];
    for (tag in req.body){
        tag_list.push(tag);
    }
    // console.log("New tag list: " ,tag_list)
    return Users.findOneAndUpdate({"_id":req.user._id},
    {$set: {"follows":tag_list}},
    {ReturnNewDocument: true})
    .exec(callback(null, tag_list));
};


/* Controller Functions
   All controller functions inputs are the standard html entities
   and outputs are variables required to render web pages
*/

// GET user details when navigating to user page
exports.user_profile = function(req, res, next) {
    async.parallel({
        tags: function(callback) {
            findTags(callback,req.user);
        },
        all_tags: function(callback) {
           
            allTags(callback);
        },
        favorites: function(callback) {
         
            findFavorites(callback,req.user);
        },
        votes: function(callback) {
        
            findVotes(callback,req.user);
        },
        comments: function(callback) {
            console.info("finding comments");
            findComments(callback,req.user);
        }   
    }, function(err, result) {
        if(err) { return next(err);}
        res.render('user_view', {
            title: 'NewW-B News Aggregator', 
            tag_list: result.tags,
            all_tags: result.all_tags, 
            user: req.user,
            favorite_list: result.favorites , 
            voted_on_list: result.votes,
            commented_on_list: result.comments,
            name: "/"
          });
    });
};


// modify user when user form is POSTed
exports.mod_user = [

    validator.body('f_name').trim(),
    validator.body('l_name').trim(),
    validator.body('email').trim(),
    validator.sanitizeBody('*').escape(),
    
    (req, res, next) => {

        const errors = validator.validationResult(req);

        if (!errors.isEmpty()){ 
            req.flash('pass_error', errors.errors);
            req.session.save(function(){
                req.session.reload(function(){
                    res.redirect('/user');
                });    
            });

        } else {
            async.parallel({
                update: function(callback) {
                    updateUser(callback, req, res)
                }
            }, function(err) {
                if(err) {return next(err);}
                req.user.l_name  = req.body.l_name;
                req.user.f_name  = req.body.f_name;
                req.user.email  = req.body.email;
                req.session.save( function(err) {
                    req.session.reload( function(err) {
                        res.redirect('/user');
                    });
                    // });    
                });
            });
        };
    }
];

// change password when change password form is POSTed
exports.change_pass = [

    validator.body('old_pass').trim(),
    validator.body('new_pass1').trim(),
    validator.body('new_pass2').trim(),
    validator.sanitizeBody('*').escape(),
    
    (req, res, next) => {

        const errors = validator.validationResult(req);

        if (!errors.isEmpty()){ 
            req.flash('pass_error', errors.errors);
            req.session.save(function(){
                req.session.reload(function(){
                    res.redirect('/user');
                });    
            });

        } else {
            async.parallel({
                errors: function(callback) {
                    changePass(callback, req, res)
                }
            }, function(err, result) {
                if(err) { return next(err);}
                req.session.save( function(err) {
                    req.session.reload( function (err) {
                        res.redirect('/user');
                    });    
                });
            });
        };
    }
];

// change followed tags when change_subs form is POSTed
exports.change_subs = function(req, res, next) {

    async.parallel({
        update: function(callback) {
            changeSubs(callback, req);
        }
    }, function (err, results) {
        if(err) { return next(err);}
        // console.info("new tag list: ",results.update);
        // console.info("old tag list: ", req.user.follows);
        
        req.user.follows = results.update;
        req.session.save( function(err) {
            req.session.reload( function (err) {
                res.redirect('/user')
            });    
        });
    });
};
// POST add_favorite form
exports.add_favorite = function(req, res, next) {
    // console.info('pushing favrite ',req.params.id, "to" , req.user.u_id );
    Users.updateOne({_id: req.user._id}, {
        $push: { "favorites": req.params.id}
    }).exec(function(err, user) {
        if(err) {return next(err);}
        req.user.favorites.push(req.params.id);
        console.info('favortites: ' ,req.user.favorites)
        res.sendStatus(200);
    })
}

// POST remove_favorite form
exports.remove_favorite = function(req, res, next) {
    Users.updateOne({_id: req.user._id}, {
        $pull: { favorites: req.params.id}
    }).exec(function(err) {
        if(err) {return next(err);}
        favorites = [];
        const obj = req.user.favorites;
        for (const fav in obj){
            // console.info(obj[fav]);
            if (obj[fav] != req.params.id){
                favorites.push(obj[fav]);
            }

        // res.sendStatus(200);
    };
    console.info("removing favorites", favorites)
    req.user.favorites = favorites;
    res.sendStatus(200);
    });
}

// POST upvote form
exports.upvote = function(req, res, next) {
    var found = false;
    for(vote of req.user.voted_on) {
        if(req.params.id == vote.article) {
            found = true;
            if(vote.vote == 1) {
                async.parallel({
                    update_user: function(callback) {
                        Users.updateOne({"_id": req.user._id}, {
                            $pull: {
                                "voted_on": {
                                    "article": req.params.id,
                                    "vote": 1
                                }
                            }
                        }).exec(callback);
                    },
                    update_article: function(callback) {
                        Article.updateOne({"_id": req.params.id}, {
                            $inc: {"rank": -1}
                        }).exec(callback);
                    }
                }, function(err, result) {
                    if(err) {return next(err);}
                    return res.sendStatus(201);
                });
            } else {
                console.log("Case 2: Changing Vote");
                async.parallel({
                    update_user: function(callback) {
                        Users.updateOne({"_id": req.user._id}, {
                            $pull: {
                                "voted_on": {
                                    "article": req.params.id,
                                    "vote": -1
                                }
                            }
                        }).then(function(){
                            Users.updateOne({"_id": req.user._id}, {
                                $push: {"voted_on": {"article": req.params.id, "vote": 1}}
                            }).exec(callback);
                        });
                    },
                    update_article: function(callback) {
                        Article.updateOne({"_id": req.params.id}, {
                            $inc: {"rank": 2}
                        }).exec(callback);
                    }
                }, function(err, result) {
                    if(err) {return next(err);}
                    return res.sendStatus(202);
                });
            }
        }
    }

    if(!found){
        async.parallel({
            update_user: function(callback) {
                Users.updateOne({"_id": req.user._id}, {
                    $push: {"voted_on": {"article": req.params.id, "vote": 1}}
                }).exec(callback);
            },
            update_article: function(callback) {
                Article.updateOne({"_id": req.params.id}, {
                    $inc: {"rank": 1}
                }).exec(callback);
            }
        }, function(err, result) {
            if(err) {return next(err);}
            return res.sendStatus(203);
        });
    }
}

// post downvote form
exports.downvote = function(req, res, next) {
    var found = false;
    for(vote of req.user.voted_on) {
        if(req.params.id == vote.article) {
            found = true;
            if(vote.vote == -1) {
                async.parallel({
                    update_user: function(callback) {
                        Users.updateOne({"_id": req.user._id}, {
                            $pull: {
                                "voted_on": {
                                    "article": req.params.id,
                                    "vote": -1
                                }
                            }
                        }).exec(callback);
                    },
                    update_article: function(callback) {
                        Article.updateOne({"_id": req.params.id}, {
                            $inc: {"rank": 1}
                        }).exec(callback);
                    }
                }, function(err, result) {
                    if(err) {return next(err);}
                    return res.sendStatus(201);
                });
            } else if(vote.vote == 1){
                async.parallel({
                    update_user: function(callback) {
                        Users.updateOne({"_id": req.user._id}, {
                            $pull: {
                                "voted_on": {
                                    "article": req.params.id,
                                    "vote": 1
                                }
                            }
                        }).then(function(){
                            Users.updateOne({"_id": req.user._id}, {
                                $push: {"voted_on": {"article": req.params.id, "vote": -1}}
                            }).exec(callback);
                        });
                    },
                    update_article: function(callback) {
                        Article.updateOne({"_id": req.params.id}, {
                            $inc: {"rank": -2}
                        }).exec(callback);
                    }
                }, function(err, result) {
                    if(err) {return next(err);}
                    return res.sendStatus(202);
                });
            }
        }
    }

    if(!found) {
        async.parallel({
            update_user: function(callback) {
                Users.updateOne({"_id": req.user._id}, {
                    $push: {"voted_on": {"article": req.params.id, "vote": -1}}
                }).exec(callback);
            },
            update_article: function(callback) {
                Article.updateOne({"_id": req.params.id}, {
                    $inc: {"rank": -1}
                }).exec(callback);
            }
        }, function(err, result) {
            if(err) {return next(err);}
            return res.sendStatus(203);
        });
    }
}

// POST remove vote form 
exports.removevote = function(req, res, next) {
    res.sendStatus(200);
}