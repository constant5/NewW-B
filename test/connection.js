// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019

const mongoose = require('mongoose')
const User  = require('../models/users');
const Article  = require('../models/articles');

// ES6 promises
// mongoose.Promise = global.Promise

// Connect to the databe before tests run
before(function(done){
    // Connect to mongodb
    mongoose.connect('mongodb://newsDev:newB@10.125.187.72:9002/news', {
        useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify:false});

    mongoose.connection.once('open', function(){
        console.log('Connection has been made...');
        done();
    }).on('error',function(error){
        console.log('Connection error:', error);
    });

});

// Drop the test user and test articles after each test

// beforeEach(function(done){
//     //Drop the test user
//     User.findOneAndRemove({u_id:'crm'}).then(function(){
//         Article.findOneAndRemove({title:'test article'}).then(function(){
//             Article.findOneAndRemove({title:'test article'}).then(function(){
//                 done();
//             });
//         });
//     });
// });

afterEach(function(done){
    //Drop the test user
    User.findOneAndRemove({u_id:'crm'}).then(function(){
        Article.findOneAndRemove({title:'test article'}).then(function(){
            Article.findOneAndRemove({title:'test article'}).then(function(){
                done();
            });
        });
    });
});