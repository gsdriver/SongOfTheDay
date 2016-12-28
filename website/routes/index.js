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
    utils.GetSong(true, (err, song) => {
        if (err)
        {
            res.render("error");
        }
        else
        {
            // Save the details of the song, which we'll use when we vote
            res.cookie("song", song);
            if (req.cookies.fbUser && req.cookies.fbUser.id)
            {
                // We have an ID - now, are they registered with SOTD?
                storage.loadUserData(req.cookies.fbUser.id, (err, userData) => {
                    res.render("index", {title: "Song of the Day", loggedIn: true, registered: (!err),
                                    loginlink: "\\login\\facebook", song: song});
                });
            }
            else
            {
                // No Facebook ID, so they have to login first
                res.render("index", {title: "Song of the Day", loggedIn: false, registered: false,
                                    loginlink: "\\login\\facebook", song: song});
            }
        }
    });
});

module.exports = router;
