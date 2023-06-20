// loginController.js
// Login controller module.
// This module provides functions to handle login-related operations.
// Developed By: Constant Marks and Michael Nutt

const Users = require('../models/users');
const {body, validationResult} = require('express-validator');
const passport = require('passport');
require('../config/passport')(passport);

/**
 * Creates a user and adds it to the database if the username
 * is unique and the passwords match.
 * @param {Object} req - The request object.
 * @return {Promise} A promise that resolves when the user is created.
 */
function createUser(req) {
  return Users.findOne({u_id: req.body.username}).then(function(result) {
    if (result == null) {
      if (req.body.password != req.body.password2) {
        req.flash('user_error', 'Passwords do not match');
      } else {
        req.flash('user_error', 'User already exists');
      }
    }
  });
}

/**
 * Deletes a user from the database.
 * @param {Object} req - The request object.
 * @return {Promise} A promise that resolves when the user is deleted.
 */
function deleteUser(req) {
  return Users.deleteOne({u_id: req.user.u_id});
}


/**
 * Creates a user when the create user form is POSTed.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
exports.create_user = [
  body('f_name').trim(),
  body('l_name').trim(),
  body('email').isLength({min: 1}).trim(),
  body('username', 'User name must not be empty').isLength({min: 1}).trim(),
  body('password', 'Password must not be empty').isLength({min: 1}).trim(),
  body('password2', 'Password must not be empty').isLength({min: 1}).trim(),

  /**
     * Middleware function for creating a user.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     */
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('user_error', errors.errors);
      req.session.save(function() {
        req.session.reload(function() {
          res.redirect('/article');
        });
      });
    } else {
      try {
        await createUser(req);
        req.session.save(function() {
          req.session.reload(function() {
            passport.authenticate('local-signup')(req, res, function() {
              res.redirect('/article');
            });
          });
        });
      } catch (err) {
        next(err);
      }
    }
  },
];

/**
 * Deletes a user when the delete user form is POSTed.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
exports.delete_user = async function(req, res, next) {
  try {
    await deleteUser(req);
    req.session.save(function(err) {
      req.session.reload(function(err) {
        res.redirect('/article');
      });
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Logs out a user when the logout form is POSTed.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
exports.logout = function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

