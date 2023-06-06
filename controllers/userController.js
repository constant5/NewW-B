// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019

var Article = require('../models/articles');
var Tags = require('../models/tags');
var Users = require('../models/users');
var async = require('async');
const validator= require('express-validator');

/* Helper functions for controller functions */

// get all tags that a user follows
function findTags(callback,user) {
    Users.findOne({'u_id':user.u_id}, {'follows':1}).then(function(follows){
        Tags.find({'tag': { $in: follows.follows}})
        .sort([['tag', 'ascending']])
        .exec(callback);
    });
};

// get all tags
function allTags(callback) {
    Tags.find({}, {tag:1})
    .sort([['tag', 'ascending']])
    .exec(callback)
}

// get a users favorites
function findFavorites(callback,user) {
    Users.findOne({u_id:user.u_id}, {_id:0,favorites:1}).then(function(favorites){
        Article.find({'_id': { $in: favorites.favorites}},{title:1, })
        .exec(callback);
    });
};

// get a users voted_on 
function findVotes(callback,user) {
    Users.findOne({u_id:user.u_id},{voted_on:1})
    .populate({path: 'voted_on.article', model: Article, select:'title'})
    .exec(callback) 
};

// get a useres commented_on
function findComments(callback,user) {
    Users.findOne({u_id:user.u_id}, {_id:0,commented_on:1}).then(function(commented_on){
        Article.find({_id: { $in: commented_on.commented_on}},{title:1})
        .exec(callback);
    });
};


// update a users details
function updateUser(callback, req){
    Users.findOneAndUpdate({u_id:req.user.u_id},
                           {f_name:req.body.f_name, 
                            l_name:req.body.l_name, 
                            email:req.body.email}).exec(callback)
};

// change a users password
function changePass(callback,req) {
    Users.findOne({u_id:req.user.u_id}).then(function(record){
        if (record.pw === req.body.old_pass) {
            if (req.body.new_pass1 === req.body.new_pass2) {
                return Users.findOneAndUpdate({u_id:req.user.u_id},{pw:req.body.new_pass1})
                       .exec(callback)
            }else{
                req.flash('pass_error','New passwords do not match');
            };
        }else{
            req.flash('pass_error','Old Passwords do not match');
        };
        callback()
    });
};

// change a users follows attribute
function changeSubs(callback, req, res) {
    var tag_list = [];
    for (tag in req.body){
        tag_list.push(tag)
    }
    //console.log(tag_list)
    Users.findOneAndUpdate({u_id:req.user.u_id}, {follows:tag_list}).exec(callback)
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
                if(err) { return next(err);}
                req.session.save( function(err) {
                    req.session.reload( function(err) {
                        res.redirect('/user');
                    });    
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
            changeSubs(callback, req, res)
        }
    }, function (err) {
        if(err) { return next(err);} 
        req.session.save( function(err) {
            req.session.reload( function (err) {
                res.redirect('/user')
            });    
        });
    });
};

// POST add_favorite form
exports.add_favorite = function(req, res, next) {
    Users.updateOne({_id: req.user.id}, {
        $push: { favorites: req.params.id}
    }).exec(function(err, user) {
        if(err) {return next(err);}
        res.sendStatus(200);
    })
}

// POST remove_favorite form
exports.remove_favorite = function(req, res, next) {
    Users.updateOne({_id: req.user.id}, {
        $pull: { favorites: req.params.id}
    }).exec(function(err, user) {
        if(err) {return next(err);}
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
                        Users.updateOne({"_id": req.user.id}, {
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
                        Users.updateOne({"_id": req.user.id}, {
                            $pull: {
                                "voted_on": {
                                    "article": req.params.id,
                                    "vote": -1
                                }
                            }
                        }).then(function(){
                            Users.updateOne({"_id": req.user.id}, {
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
                Users.updateOne({"_id": req.user.id}, {
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
                        Users.updateOne({"_id": req.user.id}, {
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
                        Users.updateOne({"_id": req.user.id}, {
                            $pull: {
                                "voted_on": {
                                    "article": req.params.id,
                                    "vote": 1
                                }
                            }
                        }).then(function(){
                            Users.updateOne({"_id": req.user.id}, {
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
                Users.updateOne({"_id": req.user.id}, {
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