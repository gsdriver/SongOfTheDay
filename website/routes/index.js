var express = require('express');
var router = express.Router();
var storage = require("../storage");
var utils = require("../Utils");

// Starting page - all users get to see the SOTD
// Flow is as follows:
//   If the user is not logged in to facebook (e.g. I can't get a userID), then prompt them to login
//   If the user is logged in but not registered with SOTD, then prompt them to register
//   If the user is logged in and registered with SOTD, then we display the voting options
router.get('/', function(req, res, next) {
    // Start by loading the song
    var params = { title: "Song of the Day", loginlink: "\\login\\facebook" };

    utils.GetSong(true, (err, song) => {
        if (err)
        {
            res.render("error");
        }
        else
        {
            // Save the details of the song, which we'll use when we vote
            params.song = song;
            res.cookie("song", song);
            if (req.cookies.fbUser && req.cookies.fbUser.id)
            {
                // We have an ID - now, are they registered with SOTD?
                params.loggedIn = true;
                storage.loadUserData(req.cookies.fbUser.id, (err, userData) => {
                    params.registered = (!err);
                    if (!err)
                    {
                        // They are registered, great.  Oh, did they vote already?
                        storage.loadVoteData(req.cookies.fbUser.id, song.date, (err, vote) => {
                            if (vote)
                            {
                                params.yourVote = vote.vote;
                            }

                            res.render("index", params);
                        });
                    }
                    else
                    {
                        res.render("index", params);
                    }
                });
            }
            else
            {
                // No Facebook ID, so they have to login first
                params.loggedIn = false;
                params.registered = false;
                res.render("index", params);
            }
        }
    });
});

module.exports = router;
