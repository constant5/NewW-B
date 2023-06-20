/* eslint-disable no-var */
// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019

const Article = require('../models/articles');
const Tags = require('../models/tags');
const Users = require('../models/users');
const Comment = require('../models/comments');

const path = require('path');
const fs = require('fs');
const async = require('async');
const validator = require('express-validator');

/* Helper functions for controller functions */

/**
 * Finds tags based on the specified user's follows or
 * returns all tags if user is undefined.
 * @param {function} callback - The callback function to handle the result.
 * @param {object} [user] - The user object containing the follows property.
 */
function findTags(callback, user) {
  if (user === undefined) {
    Tags.find()
        .sort([['tag', 'ascending']])
        .exec(callback);
  } else {
    Tags.find({'tag': {$in: user.follows}})
        .sort([['tag', 'ascending']])
        .exec(callback);
  }
}

/**
 * Loads the sidebar with search option and top tags.
 * @param {function} callback - The callback function to handle the result.
 */
function sidebar(callback) {
  Article.aggregate(
      [{'$unwind': '$keywords'}, {'$sortByCount': '$keywords'}, {'$limit': 10}],
  ).exec(callback);
}


/**
 * Converts the user's vote_on array into a dictionary.
 * @param {object} user - The user object containing the voted_on property.
 * @return {object} - The dictionary representing the user's votes,
 * where the article ID is the key and the vote is the value.
 */
function votes2Dict(user) {
  // console.info(user)

  var vDict = {};
  for (vote of user.voted_on) {
    // console.info(vote)
    vDict[vote.article] = vote.vote;
  }
  return vDict;
}
/* Controller Functions
   All controller functions inputs are the standard html entitities
   and outputs are variables required to render web pages
*/

/**
 * Brings up the index page, loading the navbar, sidebar, and article previews.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next function to call.
 */
exports.index = function(req, res, next) {
  async.parallel({
    tags: function(callback) {
      // console.info(req.user);
      findTags(callback, req.user);
    },
    sidebar: function(callback) {
      sidebar(callback);
    },
    list_articles: function(callback) {
      Article.find()
          .sort([['date', 'descending'], ['rank', 'descending']])
          .exec(callback);
    },
  }, function(err, result) {
    if (err) {
      return next(err);
    }
    let v = null;
    if (req.user) {
      v = votes2Dict(req.user);
    } else {
      v = '';
    }
    res.render('article_view', {
      title: 'NewW-B News Aggregator',
      tag_list: result.tags,
      sidebar: result.sidebar,
      article_list: result.list_articles,
      user: req.user,
      votes: v,
      name: '/',
    });
  });
};

/**
 * Brings up all articles under the specified tag.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next function to call.
 */
exports.tag_detail = function(req, res, next) {
  async.parallel({
    tag: function(callback) {
      Tags.findById(req.params.id)
          .exec(callback);
    },
    sidebar: function(callback) {
      sidebar(callback);
    },
    list_articles: function(callback) {
      const tagPromise = new Promise(function(resolve, reject) {
        Tags.findById(req.params.id)
            .exec(function(err, tag) {
            err ? reject(err) : resolve(tag);
            });
      });
      tagPromise.then(function(tag) {
        Article.find({tags: tag.tag})
            .exec(callback);
      });
    },
    list_tags: function(callback) {
      findTags(callback, req.user);
    },
  }, function(err, results) {
    if (err) {
      return next(err);
    }
    if (results.tag == null) {
      const err = new Error('Tag not found');
      err.status = 404;
      return next(err);
    }
    res.render('article_view', {
      title: results.tag.tag,
      tag: results.tag,
      sidebar: results.sidebar,
      article_list: results.list_articles,
      tag_list: results.list_tags,
      name: results.tag.tag,
      user: req.user,
    });
  });
};

/**
 * Brings up all articles by the specified author.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next function to call.
 */
exports.author_detail = function(req, res, next) {
  async.parallel({
    tags: function(callback) {
      findTags(callback, req.user);
    },
    sidebar: function(callback) {
      sidebar(callback);
    },
    article_list: function(callback) {
      authSplit = req.params.id.split('_');
      author = authSplit[0];
      for (let i = 1; i < authSplit.length; i++) {
        author += ' ' + authSplit[i];
      }
      Article.find({author: author})
          .exec(callback);
    },
  }, function(err, result) {
    if (err) {
      return next(err);
    }
    res.render('article_view', {
      title: 'NewW-B News Aggregator',
      sidebar: result.sidebar,
      tag_list: result.tags,
      article_list: result.article_list,
      name: '/',
    });
  });
};

exports.author_list = function(req, res, next) {
  res.send('NOT IMPLEMENTED: Display for Author List');
};


/**
 * Creates the main article page for viewing an article.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next function to call.
 */
exports.article_detail = function(req, res, next) {
  async.parallel({
    tags: function(callback) {
      findTags(callback, req.user);
    },
    details: function(callback) {
      Article.findById(req.params.id)
          .exec(callback);
    },
    users: function(callback) {
      Article.findById(req.params.id, {'comments': 1})
          .then(function(comments) {
            const uids = [];
            for (comment of comments.comments) {
              // console.info(comment);
              uids.push(comment.u_id);
            }
            Users.find({'_id': {$in: uids}}, {'u_id': 1})
                .exec(callback);
          });
    },
    sidebar: function(callback) {
      sidebar(callback);
    },
  }, function(err, results) {
    if (err) {
      console.log(err);
      return next(err);
    }
    const details = results.details;
    var u = {};
    // console.info(results.users);
    for (user of results.users) {
      u[user._id] = user.u_id;
    }

    try {
      p = path.join(__dirname, details.filepath);
      var contents = fs.readFileSync(p, 'utf8');
    } catch (error) {
      console.error(error);
      res.sendStatus(404);
      return;
    }
    res.render('article_detail', {
      title: details.title,
      users: u,
      user: req.user,
      comments: details.comments,
      article: details,
      article_text: contents,
      tag_list: results.tags,
      sidebar: results.sidebar,
      name: '/',
    });
  });
};


/**
 * Views all articles related to the specified keyword.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next function to call.
 */
exports.keyword_detail = function(req, res, next) {
  const key = decodeURI(req.params.id);
  async.parallel({
    sidebar: function(callback) {
      sidebar(callback);
    },
    tags: function(callback) {
      findTags(callback);
    },
    details: function(callback) {
      Article.find({keywords: key})
          .exec(callback);
    },
  }, function(err, result) {
    if (err) {
      return next(err);
    }
    res.render('article_view', {
      title: key,
      sidebar: result.sidebar,
      article_list: result.details,
      tag_list: result.tags,
      user: req.user,
      name: '/',
    });
  });
};

/**
 * Submits a new comment on an article.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next function to call.
 */
exports.submit_comment = [
  // Validate not an empty comment
  validator.body('text', 'Enter text here').isLength({min: 1}).trim(),

  // Sanitize the field
  validator.sanitizeBody('text').escape(),

  // Process the request
  (req, res, next) => {
    const errors = validator.validationResult(req);

    const comment = new Comment(
        {
          u_id: req.user._id,
          text: req.body.text,
          date: +Date.now(),
          rank: 0,
        },
    );
    if (!errors.isEmpty()) {
      res.send('INVALID COMMENT GO BACK AND TRY AGAIN');
    } else {
      async.parallel({
        article_update: function(callback) {
          Article.updateOne({'_id': req.params.id}, {
            $push: {comments: comment},
          }).exec(callback);
        },
        user_update: function(callback) {
          Users.updateOne({'_id': req.user._id}, {
            $push: {commented_on: req.params.id},
          }).exec(callback);
        },
      }, function(err, result) {
        if (err) {
          return next(err);
        }
        res.redirect('/article/' + req.params.id);
      });
    }
  },
];


// Function to search articles
// Searches title, keywords and text
exports.search = [
  // Validate not an empty comment
  validator.body('search', 'Enter search here').isLength({min: 1}).trim(),

  // Sanitize the field
  validator.sanitizeBody('search').escape(),

  // Process the request
  (req, res, next) => {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      res.send('Invalid Search!');
    }
    async.parallel({
      tags: function(callback) {
        findTags(callback, req.user);
      },
      sidebar: function(callback) {
        sidebar(callback);
      },
      list_articles: function(callback) {
        // console.log(req.body.search);
        Article.find({$or: [{'text': {$regex: req.body.search}},
          {'title': {$regex: req.body.search}}, {'keywords': req.body.search}]})
            .sort([['rank', 'ascending']])
            .exec(callback);
      },
    }, function(err, result) {
      if (err) {
        return next(err);
      }
      // console.log(result.list_articles);
      res.render('article_view', {
        tag_list: result.tags,
        sidebar: result.sidebar,
        article_list: result.list_articles,
        user: req.user,
        name: '/',
      });
    });
  },
];
