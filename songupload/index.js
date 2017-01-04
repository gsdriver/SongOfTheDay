"use strict";

var AWS = require("aws-sdk");

// Run locally if told to do so
const runDBLocal = false;
const SOTDBucket = "sotd-songfiles";

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
// Date should be of the format YYYY-MM-DD
// Date, title, and artist are required - other fields are optional
function ReadSongsFromFile(data)
{
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
            if (fields[6].length)
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

function BuildParams(event)
{
    var bucketName;
    var key;

    // Let's verify that this is a put event for our bucket
    if (event.Records && (event.Records.length > 0))
    {
        if (event.Records[0].eventName == "ObjectCreated:Put")
        {
            if (event.Records[0].s3 && event.Records[0].s3.bucket)
            {
                if (event.Records[0].s3.bucket.name == SOTDBucket)
                {
                    bucketName = SOTDBucket;
                }
            }
            if (event.Records[0].s3 && event.Records[0].s3.object)
            {
                key = event.Records[0].s3.object.key;
            }
        }
    }

    if (key && bucketName)
    {
        return {Bucket: bucketName, Key: key};
    }
    else
    {
        return null;
    }
}

// Exported function
exports.handler = function (event, context)
{
    var songlist;
    var s3 = new AWS.S3();
    var params = BuildParams(event);

    console.log(JSON.stringify(params));

    if (!params)
    {
        console.log("Invalid input " + JSON.stringify(event));
        context.fail("Invalid input parameters - check trigger settings");
    }
    else
    {
        s3.getObject(params, function(err, data) {
            if (err)
            {
                console.log("error " + err);
                context.fail(err);
            }
            else
            {
                songlist = ReadSongsFromFile(data.Body.toString());
                if (songlist)
                {
                    AddSongs(songlist, () => {
                        console.log("Done processing songs!");
                        context.succeed("Done processing songs!");
                    });
                }
                else
                {
                    console.log("Error processing songlist; no songs found");
                    context.fail("No songs found");
                }
            }
        });
    }
};
