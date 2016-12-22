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
        // OK, we'll see if there's a song for today
        // If not, we'll loop backwards over the last 31 days to see if there was a song for that day
        var date = Date.UTCNow();
        var resultSongData = null;

        storage.loadSongData(date, function(error, songData) {
            if (songData)
            {
                resultSongData = songData;
            }
            else
            {
                // OK, let's loop backwards
                var i;

                date.setDate(date.getDate() - 1);
                storage.loadSongData(date, function(error, songData) {
                    if (songData)
                    {
                        // We've got it!
                    }
                });

                for (i = 0; i < 31; i++)
                {
                    // Subtract a day and try this one
                    date.setDate(date.getDate() - 1);
                    storage.loadSongData(date, function(error, songData) {
                        if (songData)
                        {
                            // Got it!
                            break;
                        }
                    });
                }
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

