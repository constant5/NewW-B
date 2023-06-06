// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019
const assert = require('assert');
const myUsers = require('../modules/myUsers');


var myUsersInstance = new myUsers()

// Describe Tests
describe('Testing Project Modules', function(){

    // Create tests
    it('test function creates a new user with username and password', function(done){

        myUsersInstance.createUser('crm','crm123').then(function(user){
            assert(user.isNew == false);
            done();
        })
    });

    it('function to change user password', function(done){
        myUsersInstance.createUser('crm','crm123').then(function(){
            myUsersInstance.changePassword('crm','crm123','crm456','crm456').then(function(user){
                assert(user.pw === 'crm456');
                done();
            });
        });
    });

    it('function to modify user', function(done){
        myUsersInstance.createUser('crm','crm123').then(function(){
            myUsersInstance.modifyUser('crm','Constant','Marks','crmarksv@gmail.com').then(function(user){
                assert(user.l_name === 'Marks');
                done();
            });
        });
    });
});