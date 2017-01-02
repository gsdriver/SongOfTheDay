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
        storage.BulkLoadSongData(GetNowDateString(), 31, (err, songList) =>
        {
            if (err)
            {
                console.log(err);
                callback({status: err}, null);
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
                        else
                        {
                            // Second most recent by definition
                            secondMostRecent = song;
                        }
                    }
                });

                // Return the most recent or second most recent song
                var song = (current ? mostRecent : secondMostRecent);
                callback((song) ? null : {status: "Song not found"}, song);
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
    storage.BulkLoadSongData(GetNowDateString(), 31, (err, songList) =>
    {
        if (err)
        {
            console.log(err);
            callback({status: err}, null);
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

/*
 * Internal functions
 */

// Return now (PST) as YYYY-MM-DD
function GetNowDateString()
{
    // Yeah, this will be off an hour at DST, but that's OK
    // In Pacific, this should "roll over" to the next song at 1:00 AM standard,
    // or 2:00 AM daylight savings, which works fine in different US timezones
    var date = new Date(Date.now() - (3600000 * 10));
    var year = date.getUTCFullYear();
    var month = date.getUTCMonth() + 1;
    var day = date.getUTCDate();

    return (year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day);
}
