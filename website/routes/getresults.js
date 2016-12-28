var express = require('express');
var router = express.Router();
var utils = require("../Utils");

// Get results from SOTD
router.get('/', function(req, res, next) {
    utils.GetSong(true, (err, song) => {
        utils.GetSong(false, (err, oldsong) => {
            if (err)
            {
                res.render(err);
            }
            else
            {
                // Process the votes (get an average), and return everything
                var voteTotal = 0;

                if (oldsong.votes && (oldsong.votes.length > 0))
                {
                    oldsong.votes.forEach(vote => {voteTotal += vote;});
                    oldsong.result = (voteTotal / oldsong.votes.length);
                }
                else
                {
                    oldsong.result = "No results";
                }

                res.render("getresults", {title: "Song of the Day", oldsong: oldsong, song: song});
            }
        });
    });
});

module.exports = router;
