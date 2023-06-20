// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019
// Router for home -- simply redirects to /article page
const express = require('express');
const router = express.Router();

const articleController = require('../controllers/homeController');

router.get('/', articleController.index);

module.exports = router;
