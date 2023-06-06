// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019

// Comments Model
const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
var moment = require('moment');
// Create Schema 
const CommentSchema =  new Schema({
    u_id : {
        type: mongoose.Schema.Types.ObjectId, 
        required: true
    },
    date : Date, 
    text : String,
    rank : Number
});

// Schema methods
CommentSchema
.virtual('user_url')
.get(function() {
    return "/user/" + this.u_id;
})

CommentSchema
.virtual('post_date')
.get(function() {
    return moment(this.date).format('MMMM Do, YYYY');
})

// export model
const Comment = mongoose.model('comments', CommentSchema);
module.exports = Comment;
