var express = require('express');
var router = express.Router();
var storage = require("../storage");
var utils = require("../Utils");
var config = require("../config");

// Starting page - all users get to see the SOTD
// Flow is as follows:
//   If the user is not logged in to facebook (e.g. I can't get a userID), then prompt them to login
//   If the user is logged in but not registered with SOTD, then prompt them to register
//   If the user is logged in and registered with SOTD, then we display the voting options
router.post('/', function(req, res, next) {
    // Start by loading the song
    var params = { title: "Song of the Day", loginlink: "\\login\\facebook", currentSong: true };
    var userID = req.body.id;

    utils.GetSong(true, (err, song) => {
        if (err)
        {
            res.render("error", {error: err});
        }
        else
        {
            // Save the details of the song, which we'll use when we vote
            params.song = song;
            params.userID = userID;
            if (userID)
            {
                // Get the username too
                storage.GetUserName(userID, (err, username) => {
                    // We have an ID - let them vote (check first if they've already voted)
                    params.loggedIn = true;
                    params.username = username;
                    storage.GetVote(userID, song.date, (err, vote) => {
                        if (vote)
                        {
                            params.yourVote = vote;

                            // Since they already voted, we should show them comments too
                            storage.GetCommentsForDate(song.date, (err, comments) => {
                                if (comments && (comments.length > 0))
                                {
                                    params.comments = comments;
                                }
                                res.render("getsong", params);
                            });
                        }
                        else
                        {
                            // Just show the song
                            res.render("getsong", params);
                        }
                    });
                });
            }
            else
            {
                // No Facebook ID, so they have to login first
                params.loggedIn = false;
                res.render("getsong", params);
            }
        }
    });
});

router.get('/', function(req, res, next) {
    // Start by loading the song for the date
    var params = { title: "Song of the Day", userID: 0, loggedIn: true, historicSong: true };

    storage.GetSongForDate(req.query.date, (err, song) => {
        if (err)
        {
            // Just go to home page
            res.redirect("/");
        }
        else
        {
            params.song = song;

            storage.GetCommentsForDate(song.date, (err, comments) => {
                if (comments && (comments.length > 0))
                {
                    params.comments = comments;
                }
                res.render("getsong", params);
            });
        }
    });
});

module.exports = router;
