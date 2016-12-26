var express = require('express');
var router = express.Router();
var songserver = require("../SongServer");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    songserver.GetSongOfTheDay((error, song) => {
        if (error)
        {
            res.statusCode = 400;
            res.end(JSON.stringify({error: error}));
        }
        else
        {
            res.statusCode = 200;
            res.end(JSON.stringify(song));
        }
    });
});

module.exports = router;
