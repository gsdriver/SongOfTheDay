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
    storage.loadUserData(id, (err, userData) => {
        if (err)
        {
            callback(err);
        }
        else
        {
            // OK, user is registered - now make sure the song is active and
            // if so let's add this vote to the vote array
            utils.GetSong(true, (err, song) => {
                if (err)
                {
                    callback(err);
                }
                else
                {
                    // Match song by ID
                    // Make sure they haven't already voted (if so, override)
                    if (songDate != song.date)
                    {
                        callback("The current song is dated " + song.date);
                    }
                    else
                    {
                        // If they already voted, remove the existing vote
                        var i;

                        for (i = 0; i < song.votes.length; i++)
                        {
                            if (song.votes[i].user == user.id)
                            {
                                // We want to remove this one and break
                                song.votes.splice(i, 1);
                                break;
                            }
                        }

                        song.votes.push({user: id, vote: vote});
                        song.save(err => callback(err));
                    }
                }
            });
        }
    });
}

module.exports = router;
