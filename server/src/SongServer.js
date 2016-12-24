//
// This is the Song Server module
//

"use strict";

var storage = require("./storage");
var https = require("https");

/*
 * Exported functions
 */

module.exports = {
    // This function returns the Song of the Day
    GetSongOfTheDay : function (callback) {
        GetSong(true, (err, song) => {
            if (err)
            {
                callback(err, null);
            }
            else
            {
                // Don't return the values
                var resultSong = { date: song.date, title: song.title, artist: song.artist,
                    comments: song.comments, highVote: song.highVote, lowVote: song.lowVote,
                    weblink: song.weblink };

                callback(null, resultSong);
            }
        });
    },
    // This function returns the results from the last Song of the Day
    GetResults : function (callback) {
        GetSong(false, (err, song) => {
            if (err)
            {
                callback(err, null);
            }
            else
            {
                // Process the votes (get an average), and return everything
                var resultSong = { date: song.date, title: song.title, artist: song.artist,
                    comments: song.comments, highVote: song.highVote, lowVote: song.lowVote,
                    weblink: song.weblink };
                var voteTotal = 0;

                if (song.votes && (song.votes.length > 0))
                {
                    song.votes.forEach(vote => {voteTotal += vote;});
                    resultSong.result = (voteTotal / song.votes.length);
                }

                callback(null, resultSong);
            }
        });
    },
    // This function allows the user to vote - note that we require an auth token
    SubmitVote : function (authID, songDate, vote, callback) {
        // Make sure the user is registered
        GetUserFromToken(authID, (error, user) => {
            if (error)
            {
                callback(error);
            }
            else
            {
                storage.loadUserData(user.id, (err, userData) => {
                    if (err)
                    {
                        callback(err);
                    }
                    else
                    {
                        // OK, user is registered - now make sure the song is active and
                        // if so let's add this vote to the vote array
                        GetSong(true, (err, song) => {
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

                                    song.votes.push({user: user.id, vote: vote});
                                    song.save(err => callback(err));
                                }
                            }
                        });
                    }
                });
            }
        });
    },
    // This function registers a new user in our DB
    RegisterUser : function (authID, callback) {
        // Call Facebook API to get user information
        GetUserFromToken(authID, (error, user) => {
            if (error)
            {
                callback(error);
            }
            else
            {
                var userData = new storage.UserData(user.id, user.email);

                userData.save((err) => {
                    callback(err);
                });
            }
        });
    }
};

/*
 * Internal functions
 */

function GetSong(current, callback)
{
    // Pull song list from the past 31 days, and find the most recent one in the list
    // Just in case we haven't updated it for a while
    storage.bulkLoadSongData(Date.now(), 31, (err, songList) =>
    {
        if (err)
        {
            console.log(err);
            callback(err, null);
        }
        else
        {
            // Find either the most recent one or the second most recent one, depending
            // on what the caller has asked for
            var mostRecent = null;
            var secondMostRecent = null;
            var recentDate;
            var songDate;

            songList.forEach(song => {
                // Set the most recent
                songDate = new Date(song.date);
                if (!mostRecent)
                {
                    mostRecent = song;
                }
                else
                {
                    recentDate = new Date(mostRecent.date);
                    if (songDate > recentDate)
                    {
                        secondMostRecent = mostRecent;
                        mostRecent = song;
                    }
                    else if (secondMostRecent)
                    {
                        // Not the most recent, maybe the second most recent?
                        recentDate = new Date(secondMostRecent.date);
                        if (songDate > recentDate)
                        {
                            secondMostRecent = song;
                        }
                    }
                }
            });

            // Return the most recent song
            callback(null, (current ? mostRecent : secondMostRecent));
        }
    });
}

function GetUserFromToken(authID, callback)
{
    // Call Facebook API to get user information
    var options = { hostname: 'graph.facebook.com', port: 443, path: '/me' + '?access_token=' + authID, method: "GET" };

    console.log("Making FB Call " + options.path);
    var req = https.request(options, (res) => {
        if (res.statusCode == 200)
        {
            // Process the response
            var fulltext = '';
            res.on('data', (data) => {fulltext += data;});
            res.on('end', () => {
                var fbUser = JSON.parse(fulltext);

                // Pull out the id to use
                console.log("UserID is " + fbUser.id);
                callback(null, fbUser);
            });
        }
        else
        {
            // Sorry, there was an error calling the HTTP endpoint
            callback("Unable to call endpoint", null);
        }
    });
}