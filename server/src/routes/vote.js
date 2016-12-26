var express = require('express');
var router = express.Router();
var songserver = require("../SongServer");

// Save the vote
router.get('*', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    if (!req.query.access_token)
    {
        res.statusCode = 400;
        res.end(JSON.stringify({error: "Need access_token"}));
    }
    else if (!req.query.date)
    {
        res.statusCode = 400;
        res.end(JSON.stringify({error: "Need date parameter"}));
    }
    else if (!req.query.vote)
    {
        res.statusCode = 400;
        res.end(JSON.stringify({error: "Need vote parameter"}));
    }
    else
    {
        songserver.SubmitVote(req.query.access_token, req.query.date, req.query.vote, (error) => {
            if (error)
            {
                res.statusCode = 400;
                res.end(JSON.stringify({error: error}));
            }
            else
            {
                res.statusCode = 200;
                res.end();
            }
        });
    }
});

module.exports = router;
