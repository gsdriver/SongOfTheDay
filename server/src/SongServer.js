//
// This is the Song Server module
//

"use strict";

var storage = require("./storage");

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
    SubmitVote : function (authID, songID, vote, callback) {
    },
    // This function registers a new user in our DB
    RegisterUser : function (authID, callback) {
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