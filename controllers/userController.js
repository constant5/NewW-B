// UserController.js
// User controller module.
// This module provides functions to handle user-related operations.
// Developed By: Constant Marks and Michael Nutt


const Article = require('../models/articles');
const Tags = require('../models/tags');
const Users = require('../models/users');
const async = require('async');
const validator = require('express-validator');

/**
 * Retrieves all tags that a user follows.
 * @param {Function} callback - The callback function.
 * @param {Object} user - The user object.
 */
function findTags(callback, user) {
  Tags.find({'tag': {$in: user.follows}})
      .sort([['tag', 'ascending']])
      .exec(callback);
};

/**
 * Retrieves all tags.
 * @param {Function} callback - The callback function.
 */
function allTags(callback) {
  Tags.find({}, {tag: 1})
      .sort([['tag', 'ascending']])
      .exec(callback);
}

/**
 * Retrieves a user's favorites.
 * @param {Function} callback - The callback function.
 * @param {Object} user - The user object.
 */
function findFavorites(callback, user) {
  console.info('finding favorites');
  Article.find({'_id': {$in: user.favorites}}, {title: 1})
      .exec(callback);
};

/**
 * Retrieves a user's voted_on.
 * @param {Function} callback - The callback function.
 * @param {Object} user - The user object.
 */
function findVotes(callback, user) {
  console.info('finding votes');
  Users.findOne({'_id': user._id}, {'voted_on': 1})
      .populate({path: 'voted_on.article', model: Article, select: 'title'})
      .exec(callback);
};

/**
 * Retrieves a user's commented_on.
 * @param {Function} callback - The callback function.
 * @param {Object} user - The user object.
 */
function findComments(callback, user) {
  console.info('finding comments');
  Article.find({_id: {$in: user.commented_on}}, {title: 1})
      .exec(callback);
};

/**
Updates a user's details.
@param {Function} callback - The callback function.
@param {Object} req - The request object.
*/
function updateUser(callback, req) {
  Users.findOneAndUpdate({'_id': req.user._id},
      {
        $set: {
          'f_name': req.body.f_name,
          'l_name': req.body.l_name,
          'email': req.body.email,
        },
      },
      {ReturnNewDocument: true})
      .exec(callback);
};

/**
Changes a user's password.
@param {Function} callback - The callback function.
@param {Object} req - The request object.
*/
function changePass(callback, req) {
  Users.findOne({'_id': req.user._id}).then(function(record) {
    if (record.pw === req.body.old_pass) {
      if (req.body.new_pass1 === req.body.new_pass2) {
        return Users.findOneAndUpdate({u_id: req.user.u_id},
            {pw: req.body.new_pass1})
            .exec(callback);
      } else {
        req.flash('pass_error', 'New passwords do not match');
      };
    } else {
      req.flash('pass_error', 'Old Password does not match');
    };
    callback();
  });
};

/**
Changes a user's follows attribute.
@param {Function} callback - The callback function.
@param {Object} req - The request object.
@param {Object} res - The response object.
@return {Array} tagList - The modified subscription tags
*/
function changeSubs(callback, req, res) {
  const tagList = [];
  for (tag in req.body) {
    tagList.push(tag);
  }
  // console.log("New tag list: " ,tag_list)
  return Users.findOneAndUpdate({'_id': req.user._id},
      {
        $set: {'follows': tagList},
      },
      {ReturnNewDocument: true})
      .exec(callback(null, tagList));
};


/**

Retrieves user details when navigating to the user page.
@param {Object} req - The request object.
@param {Object} res - The response object.
@param {Function} next - The next function.
*/
exports.user_profile = function(req, res, next) {
  async.parallel({
    tags: function(callback) {
      findTags(callback, req.user);
    },
    all_tags: function(callback) {
      allTags(callback);
    },
    favorites: function(callback) {
      findFavorites(callback, req.user);
    },
    votes: function(callback) {
      findVotes(callback, req.user);
    },
    comments: function(callback) {
      console.info('finding comments');
      findComments(callback, req.user);
    },
  }, function(err, result) {
    if (err) {
      return next(err);
    }
    res.render('user_view', {
      title: 'NewW-B News Aggregator',
      tag_list: result.tags,
      all_tags: result.all_tags,
      user: req.user,
      favorite_list: result.favorites,
      voted_on_list: result.votes,
      commented_on_list: result.comments,
      name: '/',
    });
  });
};
/**

Modifies a user when the user form is submitted.
@param {Object} req - The request object.
@param {Object} res - The response object.
@param {Function} next - The next function.
*/
exports.mod_user = [
  validator.body('f_name').trim(),
  validator.body('l_name').trim(),
  validator.body('email').trim(),
  validator.sanitizeBody('*').escape(),

  (req, res, next) => {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('pass_error', errors.errors);
      req.session.save(function() {
        res.redirect('/user');
      });
    } else {
      async.parallel({
        update: function(callback) {
          updateUser(callback, req, res);
        },
      }, function(err) {
        if (err) {
          return next(err);
        }
        req.user.l_name = req.body.l_name;
        req.user.f_name = req.body.f_name;
        req.user.email = req.body.email;
        req.session.save( function(err) {
          res.redirect('/user');
        });
      });
    };
  },
];

/**
Changes the password when the change password form is submitted.
@param {Object} req - The request object.
@param {Object} res - The response object.
@param {Function} next - The next function.
*/
exports.change_pass = [
  validator.body('old_pass').trim(),
  validator.body('new_pass1').trim(),
  validator.body('new_pass2').trim(),
  validator.sanitizeBody('*').escape(),

  (req, res, next) => {
    const errors = validator.validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('pass_error', errors.errors);
      req.session.save(function() {
        res.redirect('/user');
      });
    } else {
      async.parallel({
        errors: function(callback) {
          changePass(callback, req, res);
        },
      }, function(err, result) {
        if (err) {
          return next(err);
        }
        req.session.save( function(err) {
          res.redirect('/user');
        });
      });
    };
  },
];

/**
Changes the followed tags when the change_subs form is submitted.
@param {Object} req - The request object.
@param {Object} res - The response object.
@param {Function} next - The next function.
*/
exports.change_subs = function(req, res, next) {
  async.parallel({
    update: function(callback) {
      changeSubs(callback, req);
    },
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    // update session
    req.user.follows = results.update;
    req.session.save( function(err) {
      res.redirect('/user');
    });
  });
};

/**
Handles the POST request for the add_favorite form.
@param {Object} req - The request object.
@param {Object} res - The response object.
@param {Function} next - The next function.
*/
exports.add_favorite = function(req, res, next) {
  // console.info('pushing favrite ',req.params.id, "to" , req.user.u_id );
  Users.updateOne({_id: req.user._id}, {
    $push: {'favorites': req.params.id},
  }).exec(function(err, user) {
    if (err) {
      return next(err);
    }
    req.user.favorites.push(req.params.id);
    console.info('favortites: ', req.user.favorites);
    res.sendStatus(200);
  });
};
/**
Handles the POST request for the remove_favorite form.
@param {Object} req - The request object.
@param {Object} res - The response object.
@param {Function} next - The next function.
*/
exports.remove_favorite = function(req, res, next) {
  Users.updateOne({_id: req.user._id}, {
    $pull: {favorites: req.params.id},
  }).exec(function(err) {
    if (err) {
      return next(err);
    }
    favorites = [];
    const obj = req.user.favorites;
    for (const fav in obj) {
    // console.info(obj[fav]);
      if (obj[fav] != req.params.id) {
        favorites.push(obj[fav]);
      }
    };
    console.info('removing favorites', favorites);
    req.user.favorites = favorites;
    res.sendStatus(200);
  });
};

/**
Handles the POST request for the upvote form.
User can only change vote if
    1. they have not voted
    3. they previously voted down and are now voting
@param {Object} req - The request object.
@param {Object} res - The response object.
@param {Function} next - The next function.
*/
exports.upvote = function(req, res, next) {
  console.info('req.user.voted_on: ', req.user.voted_on);
  console.info('req.params.id: ', req.params.id);

  let found = false;
  for (vote of req.user.voted_on) {
    console.info('vote: ', vote);
    if (req.params.id == vote.article) {
      console.info('found vote in params');
      found = true;
      // user voted
      if (vote.vote == 1) {
        // user upvoted
        async.parallel({
          update_user: function(callback) {
            Users.updateOne({'_id': req.user._id}, {
              $pull: {
                'voted_on': {
                  'article': req.params.id,
                  'vote': 1,
                },
              },
            }).exec(callback);
          },
          update_article: function(callback) {
            Article.updateOne({'_id': req.params.id}, {
              $inc: {'rank': -1},
            }).exec(callback);
          },
        }, function(err, result) {
          if (err) {
            return next(err);
          }
          return res.sendStatus(201);
        });
      } else {
        console.log('Case 2: Changing Vote');
        async.parallel({
          update_user: function(callback) {
            Users.updateOne({'_id': req.user._id}, {
              $pull: {
                'voted_on': {
                  'article': req.params.id,
                  'vote': 1,
                },
              },
            }).then(function() {
              Users.updateOne({'_id': req.user._id}, {
                $push: {'voted_on': {'article': req.params.id, 'vote': 1}},
              }).exec(callback);
            });
          },
          update_article: function(callback) {
            Article.updateOne({'_id': req.params.id}, {
              $inc: {'rank': 2},
            }).exec(callback);
          },
        }, function(err, result) {
          if (err) {
            return next(err);
          }
          return res.sendStatus(202);
        });
      }
    }
  }
  if (!found) {
    async.parallel({
      update_user: function(callback) {
        Users.updateOne({'_id': req.user._id}, {
          $push: {'voted_on': {'article': req.params.id, 'vote': 1}},
        }).exec(callback);
      },
      update_article: function(callback) {
        Article.updateOne({'_id': req.params.id}, {
          $inc: {'rank': 1},
        }).exec(callback);
      },
    }, function(err, result) {
      if (err) {
        return next(err);
      }
      return res.sendStatus(203);
    });
  }
};

// exports.upvote = function(req, res, next) {
//   async.waterfall([
//     async function getVotes(callback) {
//       const result = await findVotes(callback, req.user);
//       console.log(result);
//       callback(null, result);
//     },
//   ], function(err, result) {
//     // result now equals 'Task1 and Task2 completed'
//     console.log(result);
//   });
// };

/**
Handles the POST request for the downvote form.
@param {Object} req - The request object.
@param {Object} res - The response object.
@param {Function} next - The next function.
*/
exports.downvote = function(req, res, next) {
  let found = false;
  for (vote of req.user.voted_on) {
    if (req.params.id == vote.article) {
      found = true;
      if (vote.vote == -1) {
        async.parallel({
          update_user: function(callback) {
            Users.updateOne({'_id': req.user._id}, {
              $pull: {
                'voted_on': {
                  'article': req.params.id,
                  'vote': -1,
                },
              },
            }).exec(callback);
          },
          update_article: function(callback) {
            Article.updateOne({'_id': req.params.id}, {
              $inc: {'rank': 1},
            }).exec(callback);
          },
        }, function(err, result) {
          if (err) {
            return next(err);
          }
          return res.sendStatus(201);
        });
      } else {
        console.log('Case 2: Changing Vote');
        async.parallel({
          update_user: function(callback) {
            Users.updateOne({'_id': req.user._id}, {
              $pull: {
                'voted_on': {
                  'article': req.params.id,
                  'vote': 1,
                },
              },
            }).then(function() {
              Users.updateOne({'_id': req.user._id}, {
                $push: {'voted_on': {'article': req.params.id, 'vote': -1}},
              }).exec(callback);
            });
          },
          update_article: function(callback) {
            Article.updateOne({'_id': req.params.id}, {
              $inc: {'rank': -2},
            }).exec(callback);
          },
        }, function(err, result) {
          if (err) {
            return next(err);
          }
          return res.sendStatus(202);
        });
      }
    }
  }
  if (!found) {
    async.parallel({
      update_user: function(callback) {
        Users.updateOne({'_id': req.user._id}, {
          $push: {'voted_on': {'article': req.params.id, 'vote': -1}},
        }).exec(callback);
      },
      update_article: function(callback) {
        Article.updateOne({'_id': req.params.id}, {
          $inc: {'rank': -1},
        }).exec(callback);
      },
    }, function(err, result) {
      if (err) {
        return next(err);
      }
      return res.sendStatus(203);
    });
  }
};

// POST remove vote form
exports.removevote = function(req, res, next) {
  res.sendStatus(200);
};

