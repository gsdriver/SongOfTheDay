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
    },
    GetSongVote : function(date, callback)
    {
        GetVoteResult(date, callback);
    },
    RankAllSongsByVote : function(date, callback)
    {
        // First, read all songs
        // We should probably handle the maximum dataset limit (1MB), but frankly we're not going
        // to have nearly that much data in this table
        storage.ReadAllSongsBefore(date, (err, songList) =>
        {
            if (err)
            {
                console.log(err);
                callback({status: err}, null);
            }
            else
            {
                // OK, calculate the vote for each song
                var songsProcessed = 0;

                if (!songList.length)
                {
                    // No songs, callback with empty list
                    callback(null, songList);
                }

                songList.forEach(song => {
                    GetVoteResult(song.date, (result) => {
                        song.result = result;
                        songsProcessed++;
                        if (songsProcessed == songList.length)
                        {
                            // OK, we have them all - now sort them
                            songList.sort((a,b) => (b.result-a.result));
                            callback(null, songList);
                        }
                    })
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

function GetVoteResult(date, callback)
{
    // Process the votes (get an average), and return everything
    var voteTotal = 0;
    var result;

    storage.GetVotesForDate(date, (err, votes) => {
        if (votes && votes.length)
        {
            votes.forEach(vote => (voteTotal += parseInt(vote.vote)));
            result = (voteTotal / votes.length);
        }

        callback(result);
    });
}