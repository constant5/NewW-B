# NewW-B
News Group Aggregation Web App

### Authors
Constant Marks and Michael Nutt

## Design
Our program was built using Node.js and MongoDB with a focus on user experience. The main landing page displays all articles in the system that the user is subscribed to, or all if not logged in. The users can then navigate to specific sections for each tag or search and filter by keyword.

### Current Implementation

* Scripts pull down an RSS feed from Ars Tehnica, a news and opinion website that produces articles in technology, science, politics, and society.  The scripts parse the RSS feed of recent articles, extract the relevant metadata as attributes, and upload the articles to our database. 
* The user management system allows users to create and manage user profiles including an initial setup that validates a unique usernames and secure passwords. Users are able to view and modify some of their information as well as delete their accounts. In addition users can subscribe to and unsubscribe from topic feeds, view their favorite and bookmarked articles, view the comments they have made on articles and view their current rank on the website. 
* The main website application and homepage of the website are the article browsing interface. This page displays either a default view for users that have not logged in or a customized view for logged in users. The display shows the most recent highly ranked articles by topic. The default view shows all topics and users can navigate to subscribed topics with a tab system.
* An article view page displays when an article is selected. Below the article a comment section section is displayed. Logged in users are able to leave comments, upvote or downvote the article, and upvote and downvote other user's comments. 
* The system includes a filtering system that allows a user to filter the view by multiple parameters (publish date, rank, topic, etc.) and search capabilities to perform simple text search and advanced search.

## How to Run Locally
* Configure a local mongo db and modify user credentials in the project
* Populate the db with script "python/dbPopulate"
* Node.js required to run web server locally
* After Node is installed run the following: 
  ```
    npm install
  ```
* This will install all dependencies found in package.json
* After package is installed run the following: 
  ```
    npm script-run start
  ```
* This will start a local webserver listening on port 3000
* Then go to localhost:3000 in web browser


## Limitations
Main limitation is currently only pulls from one news source, future work would involve adding feature to add other news source RSS feeds by users.

## References
“Express Web Framework (Node.js/JavaScript).” MDN Web Docs, Mozilla, developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs.​

“Free JavaScript Training, Resources and Examples for the Community.” JavaScript.com, www.javascript.com/.​

“Getting Started.” Pugjs.org, www.pugjs.org/.​

“The Most Popular Database for Modern Apps.” MongoDB, www.mongodb.com/.​

“Stack Exchange.” Hot Questions - Stack Exchange, stackexchange.com/.​

“Where Developers Learn, Share, & Build Careers.” Stack Overflow, stackoverflow.com/.​