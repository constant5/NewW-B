// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019

// default passport local strategy 
var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
const User = require('../models/users');
const { equal } = require('assert');

// expose this function to our app using module.exports
module.exports = function(passport) {

    /* Configure session management.
    *
    * When a login session is established, information about the user will be
    * stored in the session.  This information is supplied by the `serializeUser`
    * function, which is yielding the user ID and username.
    *
    * As the user interacts with the app, subsequent requests will be authenticated
    * by verifying the session.  The same user information that was serialized at
    * session establishment will be restored when the session is authenticated by
    * the `deserializeUser` function.
    *
    * Since every request to the app needs the user ID and username, in order to
    * fetch articles and render the user element in the navigation bar, that
    * information is stored in the session.
    */
    passport.serializeUser(function(user, callback) {
        process.nextTick(function() {
            // callback(null, { id: user.id, username: user.username });
            callback(null, user );
          });
    });

    // used to de-serialize the user
    passport.deserializeUser(function(user, callback) {
        process.nextTick(function() {
            return callback(null, user);
          });
    });

    /* Configure password authentication strategy.
    *
    * The `LocalStrategy` authenticates users by verifying a username and password.
    * The strategy parses the username and password from the request and calls the
    * `verify` function.
    */

    passport.use('local-login', new LocalStrategy(function verify(username, password, callback) {
        User.findOne({ u_id :  username }, function(err, user)  {
          if (err) { return callback(err); }
          if (!user) { return callback(null, false, { message: 'Incorrect username or password.' }); }
          if (!user.validPassword(password)) { return callback(null, false, { message: 'Incorrect username or password.' }); }
          console.info("User logged in: ",user.u_id);
          return callback(null, user);
        });
      }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose username is the same as the forms username
        // we are checking to see if the user trying to login already exists
        User.findOne({ u_id :  username }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);
            // check to see if there's already a user with that email
            if (user) {
                console.info("user name taken");
                return done(null, false, req.flash('signupMessage', 'That user name is already taken.'));
            } else if (req.body.password != req.body.password2){
                return done(null, false, req.flash('signupMessage', 'The passwords do not match.'));
            } else {

                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.u_id    = username;
                newUser.pw = newUser.generateHash(password);
                newUser.f_name = req.body.f_name;
                newUser.l_name = req.body.l_name;
                newUser.email = req.body.email;

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    console.info("Created new user");
                    return done(null, newUser);
                });
            }

        });    

        });

    }));
};

