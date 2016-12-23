"use strict";

var storage = require("../src/storage");

function GetSongOfTheDay(callback) {
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
}

GetSongOfTheDay((err, song) => {
    if (song)
    {
        console.log(JSON.stringify(song));
    }
});