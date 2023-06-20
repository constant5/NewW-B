// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019

// Router for article views

const express = require('express');
const router = express.Router();

// Require controller module
const article_controller = require('../controllers/articleController');


// GET home page and user login form defualts
router.get('/', article_controller.index);
// GET tag page
router.get('/tags/:id', article_controller.tag_detail);
// GET Author Page
router.get('/author/:id', article_controller.author_detail);
// GET articles
router.get('/:id', article_controller.article_detail);
// GET keywords
router.get('/keywords/:id', article_controller.keyword_detail);
// POST search form
router.post('/search', article_controller.search);
// POST comment form
router.post('/:id', article_controller.submit_comment);

// export router
module.exports = router;
