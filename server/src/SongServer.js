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
                // Find the most recent one
                var mostRecent = null;

                songList.forEach(song => {
                    if (!mostRecent)
                    {
                        mostRecent = song;
                    }
                    else
                    {
                        let recentDate = new Date(mostRecent.date);
                        let songDate = new Date(song.date);

                        if (songDate > recentDate)
                        {
                            mostRecent = song;
                        }
                    }
                });

                // Return the most recent song
                callback(null, mostRecent);
            }
        });
    },
    // This function returns the results from the last Song of the Day
    GetResults : function (callback) {
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

