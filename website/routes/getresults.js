var express = require('express');
var router = express.Router();
var utils = require("../Utils");
var storage = require("../storage");

// Get results from SOTD
router.get('/', function(req, res, next) {
    var params = {title: "Song of the Day", userID: req.query.id, username: req.query.name};

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
                // We also need to grab any comments
                storage.GetCommentsForDate(song.date, (err, comments) => {
                    // Only pass comments to the form if there are comments
                    if (comments && (comments.length > 0))
                    {
                        params.comments = comments;
                    }

                    // Process the votes (get an average), and return everything
                    utils.GetSongVote(oldsong.date, result => {
                        oldsong.result = (result) ? result.toFixed(2) : "";
                        params.oldsong = oldsong;
                        params.song = song;

                        // And finally, let's get the full list of voted songs
                        utils.RankAllSongsByVote(song.date, (err, songVotes) => {
                            if (songVotes)
                            {
                                songVotes.forEach(songVote => {
                                    if (songVote.result)
                                    {
                                        songVote.result = songVote.result.toFixed(2);
                                    }
                                });

                                params.songVotes = songVotes;
                            }

                            res.render("getresults", params);
                        });
                    });
                });
            }
        });
    });
});

module.exports = router;
