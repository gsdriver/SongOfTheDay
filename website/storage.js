/*
 * Handles DynamoDB storage
 */

"use strict";

var AWS = require("aws-sdk");
var config = require("./config");

// Run locally if told to do so
if (config.runDBLocal) {
    AWS.config.update({
      region: "us-west-2",
      endpoint: "http://localhost:8000"
    });
}
else
{
    AWS.config.update({
      region: "us-west-2"
    });
}

var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
    // Does a bulk load of Song Data
    BulkLoadSongData : function(dateValue, numberOfEntries, callback) {
        var params = {};
        var dateKeys = BuildDateKeys(dateValue, numberOfEntries);

        params.RequestItems = {};
        params.RequestItems.SOTDSongData = {};
        params.RequestItems.SOTDSongData.Keys = dateKeys;
        dynamodb.batchGetItem(params, function(error, data) {
            if (error || (data.Responses == undefined))
            {
                // Sorry, we don't have a registered user with this ID
                // We require you to explicitly create a new one
                console.log("batchGetItem failed " + error);
                callback("Can't find song for " + dateValue, null);
                console.log(JSON.stringify(data));
            }
            else
            {
                // Process into an array
                var songList = [];

                data.Responses.SOTDSongData.forEach(song => {
                    var songData = {};

                    if (song.date && song.date.S)
                    {
                        songData.date = song.date.S;
                    }
                    if (song.title && song.title.S)
                    {
                        songData.title = song.title.S;
                    }
                    if (song.artist && song.artist.S)
                    {
                        songData.artist = song.artist.S;
                    }
                    if (song.comments && song.comments.S)
                    {
                        songData.comments = song.comments.S;
                    }
                    if (song.highVote && song.highVote.S)
                    {
                        songData.highVote = song.highVote.S;
                    }
                    if (song.lowVote && song.lowVote.S)
                    {
                        songData.lowVote = song.lowVote.S;
                    }
                    if (song.weblink && song.weblink.S)
                    {
                        songData.weblink = song.weblink.S;
                    }

                    songList.push(songData);
                });

                callback(null, songList);
            }
        });
    },
    // Registers a new user in our User DB
    RegisterUser: function(userID, email, callback) {
        dynamodb.putItem({ TableName: 'SOTDUserData', Item: { userID: {S: userID}, email: {S: email}}}, (err, data) =>
        {
            // We only need to pass the error back - no other data to return
            if (callback)
            {
                callback(err);
            }
        });
    },
    SaveVote : function(userID, date, vote, callback) {
        dynamodb.putItem({ TableName: 'SOTDVotes', Item: { userID: {S: userID}, date: {S: date}, vote: {S: vote}}}, (err, data) =>
        {
            // We only need to pass the error back - no other data to return
            if (callback)
            {
                callback(err);
            }
        });
    },
    // Gets a vote for a user and date
    GetVote : function(userID, date, callback) {
        dynamodb.getItem({TableName: 'SOTDVotes',
                          Key: { date: {S: date}, userID: {S: userID}}}, function (error, data) {
            var voteData;

            if (error || (data.Item == undefined))
            {
                // Sorry, we don't have a vote for this user/date combination
                // You need to explicitly create a new one
                console.log("Can't find vote for " + userID + " on " + date);
                callback("novote", null);
            }
            else
            {
                callback(null, data.Item.vote.S);
            }
        });
    },
    // Gets all votes for a given song (date, across all users)
    GetVotesForDate : function(date, callback) {
        var params = {};

        params.TableName = "SOTDVotes";
        params.KeyConditionExpression = "#D = :partitionkeyval";
        params.ExpressionAttributeValues = {":partitionkeyval": {S: date}};
        params.ExpressionAttributeNames = {"#D": "date"};
        dynamodb.query(params, function(error, data) {
            if (error || (data.Items == undefined))
            {
                // Sorry, we don't have votes for this date
                console.log("Error " + error + " data " + JSON.stringify(data));
                callback("Can't find votes for " + date, null);
            }
            else
            {
                // Process into an array
                var votes = [];

                data.Items.forEach(vote => {
                    var voteData = {date: vote.date.S, userID: vote.userID.S, vote: vote.vote.S};
                    votes.push(voteData);
                });

                callback(null, votes);
            }
        });
    }
};

// Generates keys
function BuildDateKeys(date, numberOfEntries)
{
    var dateKeys = [];
    var i;
    var dateString;
    var keyDate = new Date(date);

    for (i = 0; i < numberOfEntries; i++)
    {
        var year = keyDate.getUTCFullYear();
        var month = keyDate.getUTCMonth() + 1;
        var day = keyDate.getUTCDate();
        dateString = (year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day);

        dateKeys.push({date: {S: dateString}});
        keyDate.setDate(keyDate.getDate() - 1);
    }

    return dateKeys;
}


