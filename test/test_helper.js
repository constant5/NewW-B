
// test/test_helper.js
  
const mongoose = require('mongoose');
  
// tells mongoose to use ES6 implementation of promises
mongoose.Promise = global.Promise;
const MongoDB = 'mongodb+srv://newb.a31n6wu.mongodb.net/';
mongoose.connect(MongoDB,{
    dbName : 'newb',
    useNewUrlParser:true, 
    useUnifiedTopology:true,
    user: 'admin',
    pass: 'UkIviLy2FbfupOy7',
    useFindAndModify:false
});
  
mongoose.connection
    .once('open', () => console.log('Connected!'))
    .on('error', (error) => {
        console.warn('Error : ', error);
    });
      
    // runs before each test
    beforeEach((done) => {
        mongoose.connection.collections.users.drop(() => {
        done();
       });
});