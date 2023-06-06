// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019

var Tags = require('../models/tags');

/* Controller Function
   All controller functions inputs are the standard html entitities
   and outputs are variables required to render web pages
*/

// Redirects to home page
exports.index = function(req, res) {
        Tags.find()
        .sort([['tag', 'ascending']])
        .exec(function(err, list_tags) {
            if(err) { return next(err);}
            res.render('index', {title: 'NewW-B News Aggregator', tag_list: list_tags});
        });
};