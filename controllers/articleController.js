// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019

const fs = require('fs');
const path = require('path');
const async = require('async');
const validator = require('express-validator');

const Article = require('../models/article');
const Comment = require('../models/comment');
const Users = require('../models/users');

/**
 * Displays the details of an article.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Next middleware function.
 */
exports.article_detail = function(req, res, next) {
  async.parallel({
    sidebar: function(callback) {
      sidebar(callback);
    },
    tags: function(callback) {
      findTags(callback);
    },
    details: function(callback) {
      Article.findById(req.params.id)
          .populate('comments.u_id')
          .exec(callback);
    },
    users: function(callback) {
      Users.find({}, 'u_id')
          .exec(callback);
    },
  }, function(err, results) {
    if (err) {
      console.log(err);
      return next(err);
    }
    const details = results.details;
    const u = {};
    for (const user of results.users) {
      u[user._id] = user.u_id;
    }

    try {
      const p = path.join(__dirname, details.filepath);
      const contents = fs.readFileSync(p, 'utf8');
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
 * Displays all articles related to a specified keyword.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Next middleware function.
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
 * Submits a new comment on an article, saving the Article ID to the user and the comment to the Article.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Next middleware function.
 */
exports.submit_comment = [
  // Validate not an empty comment
  validator.body('text', 'Enter text here').isLength({min: 1}).trim(),

  // Sanitize the field
  validator.sanitizeBody('text').escape(),

  // Process the request
  (req, res, next) => {
    const errors = validator.validationResult(req);

    const comment = new Comment({
      u_id: req.user._id,
      text: req.body.text,
      date: +Date.now(),
      rank: 0,
    });
    if (!errors.isEmpty()) {
      res.send('INVALID COMMENT, PLEASE TRY AGAIN');
    } else {
      comment.save(function(err) {
        if (err) {
          return next(err);
        }
        Article.updateOne({'_id': req.params.id}, {
          $push: {comments: comment},
        }, function(error) {
          if (error) {
            return next(error);
          }
          res.redirect('/article/' + req.params.id);
        });
      });
    }
  },
];

/**
 * Searches for articles based on a specified keyword.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Next middleware function.
 */
exports.search = [
  // Validate not an empty search
  validator.body('search', 'Enter search here').isLength({min: 1}).trim(),

  // Sanitize the field
  validator.sanitizeBody('search').escape(),

  // Process the request
  (req, res, next) => {
    const errors = validator.validationResult(req);

    if (!errors.isEmpty()) {
      res.send('INVALID SEARCH, PLEASE TRY AGAIN');
    } else {
      async.parallel({
        sidebar: function(callback) {
          sidebar(callback);
        },
        tags: function(callback) {
          findTags(callback, req.user);
        },
        details: function(callback) {
          Article.find({$text: {$search: req.body.search}},
              {score: {$meta: 'textScore'}})
              .sort({score: {$meta: 'textScore'}})
              .exec(callback);
        },
      }, function(err, result) {
        if (err) {
          return next(err);
        }
        res.render('article_view', {
          title: 'Search: ' + req.body.search,
          sidebar: result.sidebar,
          article_list: result.details,
          tag_list: result.tags,
          user: req.user,
          name: '/',
        });
      });
    }
  },
];

/**
 * Upvotes or downvotes an article based on user input.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Next middleware function.
 */
exports.vote = function(req, res, next) {
  const v = req.params.vote;
  const id = req.params.id;
  async.parallel({
    add_vote: function(callback) {
      Article.updateOne({'_id': id}, {
        $inc: {rank: v},
      }).exec(callback);
    },
    add_user_vote: function(callback) {
      Users.updateOne({'_id': req.user._id, 'voted_on.article': {$ne: id}}, {
        $push: {voted_on: {article: id, vote: v}},
      }).exec(callback);
    },
    change_vote: function(callback) {
      Users.updateOne({'_id': req.user._id, 'voted_on.article': id}, {
        $set: {'voted_on.$.vote': v},
      }).exec(callback);
    },
  }, function(err, result) {
    if (err) {
      return next(err);
    }
    res.redirect('/article/' + id);
  });
};
