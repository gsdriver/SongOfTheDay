var express = require('express');
var router = express.Router();
var songserver = require("../SongServer");

// Register a new user
router.get('*', function(req, res, next) {
    // We need an access token to proceed
    res.setHeader('Content-Type', 'application/json');
    if (!req.query.access_token)
    {
        res.statusCode = 400;
        res.end(JSON.stringify({error: "Need access_token"}));
    }
    else
    {
        songserver.RegisterUser(req.query.access_token, (error) => {
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
