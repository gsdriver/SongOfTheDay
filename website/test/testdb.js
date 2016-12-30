"use strict";

var storage = require("../storage");
var AWS = require("aws-sdk");

// So what do you want to test?
var printUsers = true;
var printSongs = true;
var printVotes = true;
var getVoteDate = null; //"2016-12-28";

var createTables = false;

var deleteUsers = true;
var deleteSongs = false;
var deleteVotes = true;

var addSongs = false;
var addVotes = false;


function GetAllUsers(callback)
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

function GetAllSongs(callback)
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

function GetAllVotes(callback)
{
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    dynamodb.scan({TableName: 'SOTDVotes'}, function (error, data) {
        var userData;

        if (error || (data.Items == undefined))
        {
            callback(error, null);
        }
        else
        {
            callback(null, data.Items);
        }
    });
}

function createUserData(callback)
{
    var dynamodb = new AWS.DynamoDB();
    var params = {
            TableName : "SOTDUserData",
            KeySchema: [
            { AttributeName: "userID", KeyType: "HASH"}
        ],
        AttributeDefinitions: [
            { AttributeName: "userID", AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
       }
    };

    dynamodb.createTable(params, callback);
}

function createSongData(callback)
{
    var dynamodb = new AWS.DynamoDB();
    var params = {
            TableName : "SOTDSongData",
            KeySchema: [
            { AttributeName: "date", KeyType: "HASH"}
        ],
        AttributeDefinitions: [
            { AttributeName: "date", AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
       }
    };

    dynamodb.createTable(params, callback);
}

function createVotes(callback)
{
    var dynamodb = new AWS.DynamoDB();
    var params = {
            TableName : "SOTDVotes",
            KeySchema: [
            { AttributeName: "date", KeyType: "HASH"},
            { AttributeName: "userID", KeyType: "RANGE"}
        ],
        AttributeDefinitions: [
            { AttributeName: "date", AttributeType: "S" },
            { AttributeName: "userID", AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
       }
    };

    dynamodb.createTable(params, callback);
}

function CreateTables()
{
    createUserData((err) => console.log("Create UserData " + err));
    createSongData((err) => console.log("Create SongData " + err));
    createVotes((err) => console.log("Create Votes " + err));
}

// Printing
if (printUsers)
{
    GetAllUsers((err, users) => {
        if (users)
        {
            users.forEach(user => console.log(user.userID.S));
        }
    });
}

if (printSongs)
{
    GetAllSongs((err, songs) => {
        if (songs)
        {
            songs.forEach(song => console.log(JSON.stringify(song)));
        }
    });
}

if (printVotes)
{
    GetAllVotes((err, votes) => {
        if (votes)
        {
            votes.forEach(vote => console.log(JSON.stringify(vote)));
        }
    });
}

if (getVoteDate)
{
    storage.getVotesForDate(getVoteDate, (err, votes) => {
        if (votes)
        {
            votes.forEach(vote => console.log(JSON.stringify(vote)));
        }
    });
}

// Creating tables
if (createTables)
{
    CreateTables();
}

// Delete users
if (deleteUsers)
{
    var dynamodb = new AWS.DynamoDB();

    GetAllUsers((err, users) => {
        if (users)
        {
            users.forEach(user => {
                dynamodb.deleteItem({TableName: 'SOTDUserData',
                                          Key: { userID: {S: user.userID.S}}}, function (error, data) {
                      console.log("Deleted " + user.userID.S)
                });
            });
        }
    });
}

if (deleteSongs)
{
    var dynamodb = new AWS.DynamoDB();

    GetAllSongs((err, songs) => {
        if (songs)
        {
            songs.forEach(song => {
                dynamodb.deleteItem({TableName: 'SOTDSongData',
                                          Key: { date: {S: song.date.S}}}, function (error, data) {
                      console.log("Deleted " + song.date.S)
                });
            });
        }
    });
}

if (deleteVotes)
{
    var dynamodb = new AWS.DynamoDB();

    GetAllVotes((err, votes) => {
        if (votes)
        {
            votes.forEach(vote => {
                dynamodb.deleteItem({TableName: 'SOTDVotes',
                                          Key: { date: {S: vote.date.S}, userID: {S: vote.userID.S}}}, function (error, data) {
                      console.log("Deleted " + vote.userID.S + " on " + vote.date.S);
                });
            });
        }
    });
}

if (addSongs)
{
    var dynamodb = new AWS.DynamoDB();

    dynamodb.putItem({
        TableName: "SOTDSongData",
        Item: { date: {S: "2016-12-25"},
                title: {S: "ROUND AND ROUND"},
                artist: {S: "RATT"},
                comments: {S: "Rocking song with Milton Berle in the video"},
                highVote: {S: "Ratt and Roll!"},
                lowVote: {S: "Yuck"},
                weblink: {S: "https://www.youtube.com/watch?v=0u8teXR8VE4"}
              }
    }, function(err, data) {
        console.log("Added err " + err);
    });

    dynamodb.putItem({
        TableName: "SOTDSongData",
        Item: { date: {S: "2016-12-28"},
                title: {S: "MAMA WEER ALL CRAZEE"},
                artist: {S: "QUIET RIOT"},
                comments: {S: "These guys can't spell"},
                highVote: {S: "Crazee"},
                lowVote: {S: "Illiterate"},
                weblink: {S: "https://www.youtube.com/watch?v=cD8RAhCAyt4"}
              }
    }, function(err, data) {
        console.log("Added err " + err);
    });

    dynamodb.putItem({
        TableName: "SOTDSongData",
        Item: { date: {S: "2017-01-01"},
                title: {S: "NEW YEAR'S DAY"},
                artist: {S: "U2"},
                comments: {S: "Appropriate song for the holiday"},
                highVote: {S: "Jan 1"},
                lowVote: {S: "Dec 31"},
                weblink: {S: "https://www.youtube.com/watch?v=vdLuk2Agamk"}
              }
    }, function(err, data) {
        console.log("Added err " + err);
    });
}

if (addVotes)
{
    var voteData;

    voteData = storage.createVoteData(1, "2016-12-28", 3);
    voteData.save();
    voteData = storage.createVoteData(2, "2016-12-28", 2);
    voteData.save();
    voteData = storage.createVoteData(1, "2016-12-25", 4);
    voteData.save();
}