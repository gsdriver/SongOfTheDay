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

// Format a date as YYYY-MM-DD
function FormatDate(oldDate)
{
    var date = new Date(oldDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

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
    function SongData(date, title, artist, comments, highVote, lowVote, weblink, votes) {
        // Save values
        this.date = (date && date.S) ? FormatDate(date.S) : FormatDate(Date.UTCNow());
        this.title = (title && title.S) ? title.S : "";
        this.artist = (artist && artist.S) ? artist.S : "";
        this.comments = (comments && comments.S) ? comments.S : "";
        this.highVote = (highVote && highVote.S) ? highVote.S : "";
        this.lowVote = (lowVote && lowVote.S) ? lowVote.S : "";
        this.weblink = (weblink && weblink.S) ? weblink.S : "";
        this.votes = (votes && votes.S) ? JSON.parse(votes.S) : [];
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
                        weblink: {S: this.weblink},
                        votes: {S: JSON.stringify(this.votes)}}
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
                    callback("Can't find user " + userID, null);
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
        // Loads a single song data
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
        },
        // Does a bulk load of Song Data
        bulkLoadSongData : function(date, numberOfEntries, callback) {
            var params = {};
            var dateKeys = [];
            var dateValue = FormatDate(date);

            // Generate the keys
            var i;
            var keyDate = new Date(date);

            for (i = 0; i < numberOfEntries; i++)
            {
                dateKeys.push({date: {S: FormatDate(keyDate)}});
                keyDate.setDate(keyDate.getDate() - 1);
            }

            params.RequestItems = {};
            params.RequestItems.SOTDSongData = {};
            params.RequestItems.SOTDSongData.Keys = dateKeys;
            dynamodb.batchGetItem(params, function(error, data) {
                if (error || (data.Responses == undefined))
                {
                    // Sorry, we don't have a registered user with this ID
                    // We require you to explicitly create a new one
                    callback("Can't find song for " + dateValue, null);
                    console.log(JSON.stringify(data));
                }
                else
                {
                    // Process into an array
                    var songList = [];

                    data.Responses.SOTDSongData.forEach(song => {
                        var songData = new SongData(song.date, song.title, song.artist, song.comments,
                                                song.highVote, song.lowVote, song.weblink);
                        songList.push(songData);
                    });

                    callback(null, songList);
                }
            });
        }
    };
})();

module.exports = storage;
