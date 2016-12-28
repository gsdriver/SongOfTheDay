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
    GetSong : function (current, callback) {
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
    var id = 10211990886952677;
    callback(null, {id: id.toString(), email: "gsdriver@hotmail.com"});
    return;

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