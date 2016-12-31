"use strict";

var AWS = require("aws-sdk");
var fs = require("fs");

// Run locally if told to do so
const runDBLocal = true;
const fileToProcess = "songs.txt";

if (runDBLocal) {
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


function AddSongs(songlist, callback)
{
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    var itemsToAdd = songlist.length;

    // Just in case there's nothing
    if (songlist.length == 0)
    {
        callback();
    }

    songlist.forEach(song => {
        let dbItem = {TableName: "SOTDSongData",
                      Item: { date: {S: song.date}, title: {S: song.title}, artist: {S: song.artist} }};

        if (song.comments)
        {
            dbItem.Item.comments = {S: song.comments};
        }
        if (song.highVote)
        {
            dbItem.Item.highVote = {S: song.highVote};
        }
        if (song.lowVote)
        {
            dbItem.Item.lowVote = {S: song.lowVote};
        }
        if (song.weblink)
        {
            dbItem.Item.weblink = {S: song.weblink};
        }

        dynamodb.putItem(dbItem, function(err, data) {
            itemsToAdd--;
            if (itemsToAdd == 0)
            {
                // All done
                callback();
            }
        });
    });
}

// Format is tab-delimited file with fields in the following order:
//    date, title, artist, comments, highVote, lowVote, weblink
// Date should be of the format MM-DD-YYYY
// Date, title, and artist are required - other fields are optional
function ReadSongsFromFile(filename)
{
    var data = fs.readFileSync(filename, "UTF-8");
    var lines = data.split("\n");
    var songlist = [];

    lines.forEach(line => {
        let fields = line.split("\t");
        var song = {};

        // We need 7 fields to process - no more no less
        if (fields.length == 7)
        {
            // Date, title, and artist are required
            // Might want to do some verification of the date format?
            song.date = fields[0];
            song.title = fields[1];
            song.artist = fields[2];
            if (fields[3].length)
            {
                song.comments = fields[3];
            }
            if (fields[4].length)
            {
                song.highVote = fields[4];
            }
            if (fields[5].length)
            {
                song.lowVote = fields[5];
            }
            if (fields[6].weblink)
            {
                song.weblink = fields[6];
            }

            songlist.push(song);
        }
        else
        {
            console.log("Bad input " + line);
        }
    });

    return ((songlist.length > 0) ? songlist : null);
}

// Exported function
exports.handler = function (event, context)
{
    var songlist;

    songlist = ReadSongsFromFile(fileToProcess);
    if (songlist)
    {
        AddSongs(songlist, () => {
            console.log("Done processing songs!");
            context.done("Done processing songs!");
        });
    }
    else
    {
        console.log("Error processing songlist; no songs found");
        context.done("No songs found");
    }
};
