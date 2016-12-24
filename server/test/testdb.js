"use strict";

var storage = require("../src/storage");
var https = require("https");

const FBToken = "";

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

function GetUserFromToken(authID, callback)
{
    // Call Facebook API to get user information
    var options = { hostname: 'graph.facebook.com', port: 443, path: '/me' + '?access_token=' + authID, method: "GET" };

    console.log("Making FB Call " + options.path);
    try
    {
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
    catch (e)
    {
        callback(e, null);
    }
}

var AWS = require("aws-sdk");

function PrintAllUsers(callback)
{
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    dynamodb.scan({TableName: 'SOTDUserData'}, function (error, data) {
        var userData;

        if (error || (data.Items == undefined))
        {
            // Sorry, we don't have a registered user with this ID
            // We require you to explicitly create a new one
            callback(error, null);
        }
        else
        {
            callback(null, data.Items);
        }
    });
}

function PrintAllSongs(callback)
{
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    dynamodb.scan({TableName: 'SOTDSongData'}, function (error, data) {
        var userData;

        if (error || (data.Items == undefined))
        {
            // Sorry, we don't have a registered user with this ID
            // We require you to explicitly create a new one
            callback(error, null);
        }
        else
        {
            callback(null, data.Items);
        }
    });
}

GetUserFromToken(FBToken, (err, user) => {
    console.log(err);
    console.log(JSON.stringify(user));
});

/*
GetSongOfTheDay((err, song) => {
    if (song)
    {
        console.log(JSON.stringify(song));
    }
});
*/

/*
PrintAllUsers((err, users) => {
    if (users)
    {
        users.forEach(user => console.log(user.userID.S));
    }
});
*/

/*
PrintAllSongs((err, songs) => {
    if (songs)
    {
        songs.forEach(song => console.log(JSON.stringify(song)));
    }
});
*/