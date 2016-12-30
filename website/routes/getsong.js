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
    var params = { title: "Song of the Day", loginlink: "\\login\\facebook", fbAppID: config.CLIENT_ID };
    var userID = req.body.id;

    utils.GetSong(true, (err, song) => {
        if (err)
        {
            res.render("error");
        }
        else
        {
            // Save the details of the song, which we'll use when we vote
            params.song = song;
            params.userID = userID;
            if (userID)
            {
                // We have an ID - let them vote (check first if they've already voted)
                params.loggedIn = true;
                storage.loadVoteData(userID, song.date, (err, vote) => {
                    if (vote)
                    {
                        params.yourVote = vote.vote;
                    }

                    res.render("getsong", params);
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

module.exports = router;
