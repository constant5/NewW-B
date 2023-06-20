// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019
// Router for login methods
const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../config/passport')(passport);

// Require controller modules
const login_controller = require('../controllers/loginController');

// POST user login form
router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/article', // redirect back but logged in
  failureRedirect: '/article', // redirect back but not logged in
  failureFlash: true, // allow flash messages
}));

// POST user logout form
router.post('/logout', login_controller.logout);
// POST user create form
router.post('/create_user', login_controller.create_user);
// POST user delete form
router.post('/delete_user', login_controller.delete_user);

// export router
module.exports = router;
