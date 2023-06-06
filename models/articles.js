// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019

// Article model
const mongoose = require('mongoose');
const Tag = require('./tags');
const Comment = require('./comments')
const Schema =  mongoose.Schema;
var moment = require('moment');

// Create Schema
const ArticleSchema =  new Schema({
    newsgroup: String,
    title : String,
    author : String,
    date : Date,
    url : String,
    filepath : String,
    summary: String,
    tags : String,
    keywords: [String],
    rank : Number,
    comments : [Comment.schema], 
    text : String,
    img : String
});

// Schema methods

ArticleSchema
.virtual('article_url')
.get(function() {
    return '/article/' + this.id;
})

ArticleSchema
.virtual('post_date')
.get(function() {
    return moment(this.date).format('MMMM Do, YYYY');
})

ArticleSchema
.virtual('author_url')
.get(function(){
    auth = this.author.split(" ");
    author = auth[0];
    for(var i = 1; i < auth.length; i++) {
        author += "_" + auth[i];
    }
    return '/article/author/' + author;
});

/// export model
const Article = mongoose.model('articles', ArticleSchema);
module.exports = Article;
