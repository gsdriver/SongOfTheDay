var express = require('express');
var router = express.Router();
var utils = require("../Utils");
var storage = require("../storage");

// Save the vote
router.post('*', function(req, res, next) {
    // First see if they have the fbUser - if not, we need to redirect them to login
    if (!req.cookies.fbUser)
    {
        // This shouldn't happen
        res.render("error");
    }

    // Place the vote
    SaveVote(req.cookies.fbUser.id, req.cookies.song.date, req.body.vote, (err) => {
        if (err)
        {
            res.render("error");
        }
        else
        {
            // Let them know the results of yesterday's song
            res.redirect("/getresults");
        }
    });
});

function SaveVote(id, songDate, vote, callback)
{
    var voteData = storage.createVoteData(id, songDate, vote);
    voteData.save((err) => callback(err));
}

module.exports = router;
