// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019

const assert = require('assert');
const User = require('../models/users');
const Article = require('../models/articles');

// Describe Tests
describe('Saving Records', function(){

    // Create tests
    it('saves a user record to the database', function(done){
        var user = new User({
            u_id : 'crm',
            pw : 'crm123',
        });

        user.save().then(function(){
            assert(user.isNew === false);
            done();
        });

    });

    it('saves an article to the database', function(done){
        var test_doc = new Article({title:'test article', author:'john doe'});

        test_doc.save().then(function(record){
            assert(test_doc.isNew == false);
            done();
        });

    });

});