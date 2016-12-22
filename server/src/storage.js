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

// Format a date as YYYY-MM-DD (UTC)
function FormatDate(date)
{
    var year = date.getUTCFullYear();
    var month = date.getUTCFullMonth() + 1;
    var day = date.getUTCDate();

    return (year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day);
}

var storage = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    // The UserData class stores information about a registered user
    function UserData(userID, email) {
        // Save values
        this.userID = (userID) ? userID : "";
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
        this.date = (date) ? FormatDate(date) : FormatDate(Date.UTCNow());
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

    return {
        loadUserData: function(userID, callback) {
            dynamodb.getItem({TableName: 'SOTDUserData',
                              Key: { UserID: {S: session.user.userId}}}, function (error, data) {
                var userData;

                if (error || (data.Item == undefined))
                {
                    // Sorry, we don't have a registered user with this ID
                    // We require you to explicitly create a new one
                    callback("Can't find user " + userID, null);
                }
                else
                {
                    userData = new UserData(userID, data.Item.email.S);
                    callback(null, userData);
                }
            });
        },
        // Add a BulkGetItem call
        loadSongData: function(date, callback) {
            var dateValue = FormatDate(date);

            dynamodb.getItem({TableName: 'SOTDSongData',
                              Key: { date: {S: dateValue}}}, function (error, data) {
                var songData;

                if (error || (data.Item == undefined))
                {
                    // Sorry, we don't have a registered user with this ID
                    // We require you to explicitly create a new one
                    callback("Can't find song for " + dateValue, null);
                }
                else
                {
                    songData = new SongData(dateValue, data.Item.title.S, data.Item.artist.S, data.Item.comments.S,
                                            data.Item.highVote.S, data.Item.lowVote.S, data.Item.weblink.S);
                    callback(null, songData);
                }
            });
        }
    };
})();

module.exports = storage;
