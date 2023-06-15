// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019
const User = require('../models/users');
const Article = require('../models/articles');
const assert = require('assert');

// Describe Tests
describe('Finding records', function(){

    var user
    // create a user
    beforeEach(function(done){
        user = new User({
            u_id : 'crm',
            pw : 'crm123'
        });

        user.save().then(function(){
            done();
        });

    });

    // create tests
    it('Finds one user record from the database', function(done){

        User.findOne({u_id:'crm'}).then(function(result){
            assert(result.u_id === 'crm');
            done();
        });
    });

    it('Finds one user record by ID from the database', function(done){
        
        User.findOne({_id:user._id}).then(function(result){
            assert(result._id.toString() === user._id.toString());
            done();
        });
    });

});


describe('Finding articles', function(){

    var user
    // create a user
    beforeEach(function(done){
        article = new Article({
            title : 'test',
            text : 'Metazoans, or or 13,678'
        });

        article.save().then(function(){
            done();
        });

    });

    // create tests
    it('Finds one article from the database', function(done){

        Article.findOne({title:'test'}).then(function(result){
            assert(result.text === 'Metazoans, or or 13,678');
            done();
        });
    });

});