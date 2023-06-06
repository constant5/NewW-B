// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019
const User  = require('../models/users');
const Article  = require('../models/articles');
const Comment = require('../models/comments');
const assert =  require('assert');

// Describe tests
describe('Nesting records', function(){

    // create tests
    it('Creates a user with sub-documents', function(done){

        var test_doc = new Article({title:'test article', author:'john doe'});

        test_doc.save().then(function(result){
            var robin = new User({
                u_id : 'crm',
                pw : 'rm123',
                f_name : 'Robin', 
                favorites : [result._id] 
            });

            robin.save().then(function(){
                User.findOne({f_name:'Robin'}).then(function(record){
                    assert(record.favorites.length === 1);
                    done();
                });
            });

        });
    });

    it('Add an article to a users favorites', function(done){

        var test_doc_1 = new Article({title:'test article', author:'john doe'});

        test_doc_1.save().then(function(result){
            var robin = new User({
                u_id : 'crm',
                pw : 'rm123',
                f_name : 'Robin', 
                favorites : [result._id] 
            });

            robin.save().then(function(){
                var test_doc_2 = new Article({title:'test article 2', author:'john doe'});

                test_doc_2.save().then(function(result){
                    User.findOne({f_name:'Robin'}).then(function(record){
                        // add an article to the favorites array
                        record.favorites.push(result._id);
                        record.save().then(function(){
                            User.findOne({f_name:'Robin'}).then(function(result){
                                assert(result.favorites.length == 2);
                                done();
                            });
                        });
                    });
                });
            }); 
        });
    });

    it('add a comment to an article', function(done){

        var test_doc_1 = new Article({title:'test article', author:'john doe'});

        test_doc_1.save().then(function(result){
            var robin = new User({
                u_id : 'crm',
                pw : 'rm123',
                f_name : 'Robin',
                comments: []
            });
            robin.save().then(function(record){
                var comment = new Comment({u_id:record._id, text:'LOL, PmP!!!!'})
                Article.findOneAndUpdate({title : 'test article'}).then(function(record){
                    record.comments.push(comment);
                    record.save().then(function(){
                        Article.findOne({title:'test article'}).then(function(result){
                            assert(result.comments.length >= 1);
                            robin.commented_on.push(result._id);
                            robin.save().then(function(record){
                                assert(record.commented_on.length >= 1);
                                done();
                            });
                        });
                    });
                });
            });
        }); 
    });
});