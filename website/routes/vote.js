var express = require('express');
var router = express.Router();
var utils = require("../Utils");
var storage = require("../storage");

// Save the vote
router.post('*', function(req, res, next) {
    // Place the vote
    SaveVote(req.query.id, req.query.date, req.body.vote, (err) => {
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
