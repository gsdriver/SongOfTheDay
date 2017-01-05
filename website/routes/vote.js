var express = require('express');
var router = express.Router();
var utils = require("../Utils");
var storage = require("../storage");

// Save the vote
router.post('*', function(req, res, next) {
    // First get the current song and make sure that the date matches
    utils.GetSong(true, (err, song) => {
        if ((err) || (song.date != req.body.date))
        {
            // You are trying to vote for a different song than the current one
            res.redirect("/getresults/?closed=true&id=" + req.body.id);
        }
        else
        {
            // Place the vote
            storage.SaveVote(req.body.id, req.body.date, req.body.vote, (err) => {
                if (err)
                {
                    res.render("error", {error: err});
                }
                else
                {
                    // Let them know the results of yesterday's song
                    res.redirect("/getresults/?id=" + req.body.id);
                }
            });
        }
    });
});

module.exports = router;
