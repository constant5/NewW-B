// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019
//Router for user methods
var express = require('express');
var router = express.Router();

// Require controller modules
var user_controller = require('../controllers/userController');

// GET home page and user login form defualts
router.get('/', user_controller.user_profile);
// POST home page and user login form defualts
router.post('/', user_controller.user_profile);
// POST mofidy user form
router.post('/mod_user', user_controller.mod_user);
// POST modify password form
router.post('/change_pass', user_controller.change_pass);
// POST cmodiy subscritions form
router.post('/change_subs', user_controller.change_subs);
// POST add a favorite form
router.post('/favorited/:id', user_controller.add_favorite);
// POST remove a favorite form
router.post('/unfavorited/:id', user_controller.remove_favorite);
// POST upvote form
router.post('/upvote/:id', user_controller.upvote);
// POST downvote form
router.post('/downvote/:id', user_controller.downvote);
// POST removevote form
router.post('/removevote/:id', user_controller.removevote);

// export router
module.exports = router;