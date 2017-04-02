var express = require('express');
var router = express.Router();
var utils = require("../Utils");
var storage = require("../storage");

// Save the vote
router.post('*', function(req, res, next) {
    // Deny if there isn't a body
    if (!req.body.hasOwnProperty('date') ||
      !req.body.hasOwnProperty('id') ||
      !req.body.hasOwnProperty('vote'))
    {
      console.log('Required fields missing');
      res.statusCode = 400;
      return res.send('Required fields missing');
    }

    // Now get the current song and make sure that the date matches
    utils.GetSong(true, (err, song) => {
        if ((err) || (song.date != req.body.date))
        {
            // You are trying to vote for a different song than the current one
            console.log('Passed date ' + req.body.date + ' doesn\'t match ' + song.date);
            res.statusCode = 400;
            return res.send('Voting for the incorrect day\'s song');
        }
        else
        {
            // Place the vote
            storage.SaveVote(req.body.id, req.body.date, req.body.vote, (err) => {
                if (err)
                {
                    console.log(err);
                    res.statusCode = 400;
                    return res.send('Problem saving vote');
                }
                else
                {
                    res.json(true);
                }
            });
        }
    });
});

module.exports = router;
