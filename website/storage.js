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

var storage = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    // The UserData class stores information about a registered user
    function UserData(userID, email) {
        // Save values
        this.userID = (userID) ? String(userID) : "";
        this.email = (email) ? email : "";
    }

    UserData.prototype = {
        save: function(callback) {
            dynamodb.putItem({
                TableName: 'SOTDUserData',
                Item: { userID: {S: this.userID},
                        email: {S: this.email}}
            }, function (err, data) {
                // We only need to pass the error back - no other data to return
                if (err)
                {
                    console.log(err, err.stack);
                }
                if (callback)
                {
                    callback(err);
                }
            });
        }
    };

    // The SongData class stores information about a given song
    function SongData(date, title, artist, comments, highVote, lowVote, weblink) {
        // Save values
        this.date = (date) ? date : "";
        this.title = (title) ? title : "";
        this.artist = (artist) ? artist : "";
        this.comments = (comments) ? comments : "";
        this.highVote = (highVote) ? highVote : "";
        this.lowVote = (lowVote) ? lowVote : "";
        this.weblink = (weblink) ? weblink : "";
    }

    SongData.prototype = {
        save: function(callback) {
            dynamodb.putItem({
                TableName: "SOTDSongData",
                Item: { date: {S: this.date},
                        title: {S: this.title},
                        artist: {S: this.artist},
                        comments: {S: this.comments},
                        highVote: {S: this.highVote},
                        lowVote: {S: this.lowVote},
                        weblink: {S: this.weblink}}
            }, function(err, data) {
                // We only need to pass the error back - no other data to return
                if (err)
                {
                    console.log(err, err.stack);
                }
                if (callback)
                {
                    callback(err);
                }
            });
        }
    };

    // The VoteData class stores information about votes for a given song
    function VoteData(date, userID, vote) {
        // Save values
        this.date = (date) ? date : "";
        this.userID = (userID) ? String(userID) : "";
        this.vote = (vote) ? String(vote) : "";
    }

    VoteData.prototype = {
        save: function(callback) {
            dynamodb.putItem({
                TableName: "SOTDVotes",
                Item: { date: {S: this.date},
                        userID: {S: this.userID},
                        vote: {S: this.vote}}
            }, function(err, data) {
                // We only need to pass the error back - no other data to return
                if (err)
                {
                    console.log(err, err.stack);
                }
                if (callback)
                {
                    callback(err);
                }
            });
        }
    };

    return {
        loadUserData: function(userID, callback) {
            dynamodb.getItem({TableName: 'SOTDUserData',
                              Key: { userID: {S: userID}}}, function (error, data) {
                var userData;

                if (error || (data.Item == undefined))
                {
                    // Sorry, we don't have a registered user with this ID
                    // We require you to explicitly create a new one
                    console.log("Can't find user " + userID);
                    callback("unknownuser", null);
                }
                else
                {
                    userData = new UserData(userID, data.Item.email.S);
                    callback(null, userData);
                }
            });
        },
        createNewUser: function(userID, email) {
            return new UserData(userID, email);
        },
        // Does a bulk load of Song Data
        bulkLoadSongData : function(dateValue, numberOfEntries, callback) {
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
                        var songData = new SongData(song.date.S, song.title.S, song.artist.S, song.comments.S,
                                                song.highVote.S, song.lowVote.S, song.weblink.S);
                        songList.push(songData);
                    });

                    callback(null, songList);
                }
            });
        },
        // Load a user's vote
        loadVoteData : function(userID, date, callback) {
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
                    voteData = new VoteData(data.Item.date.S, data.Item.userID.S, data.Item.vote.S);
                    callback(null, voteData);
                }
            });
        },
        createVoteData : function(userID, date, vote) {
            return new VoteData(date, userID, vote);
        },
        // Gets all votes for a given song (date)
        getVotesForDate : function(date, callback) {
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
                        var voteData = new VoteData(vote.date.S, vote.userID.S, vote.vote.S);
                        votes.push(voteData);
                    });

                    callback(null, votes);
                }
            });
        }
    };
})();

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

module.exports = storage;
