// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019
// Router for index -- simply redirects to /article page
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/article');
});

// export router
module.exports = router;
