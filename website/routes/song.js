var express = require('express');
var router = express.Router();
var utils = require("../Utils");

// You do not have to be logged in to retrieve the song of the day
router.get('/', function(req, res, next) {
    utils.GetSong(true, (err, song) => {
        if (err)
        {
            // Return the error
            res.json(err);
        }
        else
        {
            // Just return a few parameters
            const resultSong = {date: song.date, title: song.title, artist: song.artist, comments: song.comments};

            res.json(resultSong);
        }
    });
});

module.exports = router;
