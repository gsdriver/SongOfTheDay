var express = require('express');
var router = express.Router();
var utils = require("../Utils");
var storage = require("../storage");

// Get results from SOTD
router.get('/', function(req, res, next) {
    var params = {title: "Song of the Day"};

    if (req.query.closed)
    {
        // This means the user tried to vote on a song that's already closed
        // We'll want to message that to them
        params.closed = true;
    }

    utils.GetSong(true, (err, song) => {
        utils.GetSong(false, (err, oldsong) => {
            if (err)
            {
                res.render("error", {error: err});
            }
            else
            {
                // Process the votes (get an average), and return everything
                var voteTotal = 0;

                storage.GetVotesForDate(oldsong.date, (err, votes) => {
                    if (votes && votes.length)
                    {
                        votes.forEach(vote => (voteTotal += parseInt(vote.vote)));
                        oldsong.result = String(voteTotal / votes.length);
                    }
                    else
                    {
                        oldsong.result = "No results";
                    }

                    params.oldsong = oldsong;
                    params.song = song;
                    res.render("getresults", params);
                });
            }
        });
    });
});

module.exports = router;
