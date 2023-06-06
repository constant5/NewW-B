// Developed By: Constant Marks and Michael Nutt
// Last Modified: 11/25/2019

// Last modified Nov 25th
// Authors: Constant Marks and Michael Nutt
/*
*  Function to asynchronously add article to favorites list
*  Input: Article ID
*  Output: 
*/
function favorite(id) {
    var btn = document.getElementById(id);
    if(btn.innerHTML === "Favorite") {
        var article = '/user/favorited/' + id;
        fetch(article, {method: 'POST'})
        .then(function(response){
            if(response.ok) {
                console.log("Favorited!");
                btn.classList.remove("btn-success");
                btn.classList.add("btn-danger");
                btn.innerHTML = "Unfavorite";
                return;
            }
            throw new Error('Request failed.');
        })
        .catch(function(error) {
            console.log(error);
        });
    } else {
        var article = '/user/unfavorited/' + id;
        fetch(article, {method: 'POST'})
        .then(function(response) {
            if(response.ok) {
                console.log("Unfavorited!");
                btn.classList.remove("btn-danger");
                btn.classList.add("btn-success");
                btn.innerHTML = "Favorite";
                return;
            }
            throw new Error('Request failed.');
        })
        .catch(function(error) {
            console.log(error);
        });
    }
}

/*
*  Function to upvote article ranking
*  Input: Article ID
*  Output: 
*/

function upvote(id) {
    var rbtn = document.getElementById('rank-'+id);
    fetch('/user/upvote/'+id, {method: 'POST'})
    .then(function(response){
        if(response.status == 203) {
            rbtn.innerHTML++;
        } else if(response.status == 201) {
            rbtn.innerHTML--;
        } else if(response.status == 202) {
            rbtn.innerHTML++;
            rbtn.innerHTML++;
        }
    });
}

/*
*  Function to downvote article ranking
*  Input: Article ID
*  Output: 
*/

function downvote(id) {
    var rbtn = document.getElementById('rank-'+id);
    fetch('/user/downvote/'+id, {method: 'POST'})
    .then(function(response){
        if(response.status == 203) {
            rbtn.innerHTML--;
        } else if(response.status == 201) {
            rbtn.innerHTML++;
        } else if(response.status == 202) {
            rbtn.innerHTML--;
            rbtn.innerHTML--;
        }
    });
}