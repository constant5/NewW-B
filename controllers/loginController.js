// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019

var Users = require('../models/users');
var async = require('async');
const validator= require('express-validator');
var passport = require('passport');
require('../config/passport')(passport)


/* Helper functions for controller functions */

// creates a user and adds to DB if username is unique and passwords match
function createUser(callback, req, res){

  Users.findOne({u_id:req.body.username}).then(function(result){
        if (result === null) {
            if (req.body.new_pass1==req.body.new_pass2){
                var user = new Users({u_id: req.body.username, 
                                        f_name:req.body.f_name, 
                                        l_name:req.body.l_name, 
                                        email:req.body.email,
                                        pw:req.body.password});
                user.save();

                } else{
                    req.flash('user_error','Passwords do not match');
                };
        }else{
            req.flash('user_error','User already exists'); 
        };
        console.log(req.flash());
        callback();
    });
};

// simply deletes a user from the DB
function deleteUser(callback, req){
    Users.deleteOne({u_id:req.user.u_id}).exec(callback);
}

/* Controller Functions
   All controller functions inputs are the standard html entitities
   and outputs are variables required to render web pages
*/

// creates a user when the create user form is POSTed
exports.create_user = [
    validator.body('f_name').trim(),
    validator.body('l_name').trim(),
    validator.body('email').isLength({ min: 1 }).trim(),
    validator.body('username', 'User name must not be empty').isLength({ min: 1 }).trim(),
    validator.body('password','Password must not be empty').isLength({ min: 1 }).trim(),
    validator.body('password2','Password must not be empty').isLength({ min: 1 }).trim(),
    validator.sanitizeBody('*').escape(),

    (req, res, next) => {

        const errors = validator.validationResult(req);

        if (!errors.isEmpty()){ 
            req.flash('user_error', errors.errors);
            req.session.save(function(){
                req.session.reload(function(){
                    res.redirect('/article');
                });    
            });

        } else {
            async.parallel({
                update: function(callback) {
                    createUser(callback, req, res);
                }
            }, function(err){
                if(err) { return next(err);}
                req.session.save(function(){
                    req.session.reload(function(){
                        //res.redirect('/article');
                        passport.authenticate('local-login')(req, res, function () {
                            res.redirect('/article');     
                        });
                    });    
                });
            });
        };
    }
];

// deletes a user when the delete user form is POSTed
exports.delete_user = function(req, res, next){
    async.parallel({
        update: function(callback) {
            deleteUser(callback, req, res)
        }
    }, function(err, result) {
        if(err) { return next(err);}
        req.session.save( function(err) {
            req.session.reload( function (err) {
                res.redirect('/article');
            });    
        });
    });
};


// logout a user when the logout form is POSTed
exports.logout= function(req, res){
    req.logout();
    res.redirect('/');
};