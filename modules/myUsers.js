// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019

// legacy user methods only required for mocha tests
const User = require('../models/users');

function myUsers() {

    this.createUser = function(u_name, password) {
        return new Promise(function(resolve, reject){
            var user = new User({
                u_id : u_name, 
                pw: password
            });

            user.save().then(function(record){
                resolve(user);
            }).catch(function(){
                reject('problem creating user')
            });
        });
    };

    
    this.getUserName = function(u_name) {
        return new Promise(function(resolve, reject){
            User.findOne({u_id:u_name}).then(function(record){
                if (record.uid !== null) {
                    resolve(record.f_name);
                };
            }).catch(function(){reject('problem finding user')
            });
        });
    };

    this.verifyUser = function(u_name) {
        return new Promise(
            function(resolve, reject){
                User.findOne({u_id:u_name}).then(function(record){
                    if (record  !== null){
                        resolve(true);
                    }
                    else{ 
                        reject(false);
                    };     
                });
            }).catch(function(reason){return reason});
    };


    this.verifyPassword = function(u_name, pw) {
        return new Promise(
            function(resolve, reject){
                User.findOne({u_id:u_name}).then(function(record){
                    if (record.pw === pw){
                        resolve(true);
                    } else{
                        reject(false);
                    }; 
                });
            }).catch(function(reason){return reason});
    };

    this.changePassword = function(u_name, old_pass, new_pass1, new_pass2) {
        return new Promise(
            function(resolve, reject){
                User.findOne({u_id:u_name}).then(function(record){
                    if (record.pw === old_pass) {
                        if (new_pass1 === new_pass2) {
                            record.pw = new_pass1;
                            record.save().then(function(record){
                                resolve(record);
                            });
                        } else { 
                            reject('new passwords do not match')
                        };
                    } else {
                        reject('password invalid');
                    };
                });
        }).catch(function(reason){return reason});
    };

    this.modifyUser = function(uname, f_name, l_name, email){
        return new Promise(
            function(resolve, reject){
                User.findOne({u_id:uname}).then(function(record){
                    if (f_name !== undefined){
                        record.f_name = f_name;
                    };
                    if (l_name !== undefined){
                        record.l_name = l_name;
                    };
                    if (email !== undefined){
                        record.email = email
                    };
                    record.save().then(function(record){
                        resolve(record)

                    });
                });
        }).catch(function(reason){return reason});
    };
};

module.exports = myUsers;