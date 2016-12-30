
const fs = require('fs');

/*
 * Helper functionality to create an initial song tree from the big list of songs
 */

const bigSongList = 'songlist.txt';

module.exports = {
 CreateInitialTree : function()
{
    var i;
    var numSongs;
    var songTree = {songList: [], children: []};

    // Read in all the lines    
    var data = fs.readFileSync(bigSongList, "ascii");
    lines = data.split("\n");

    // Trim the \r from each line
    for (i = 0; i < lines.length; i++)
    {
        lines[i] = lines[i].substr(0, lines[i].length - 1);
    }
    numSongs = lines.length / 2;

    // Now, let's start adding in layers of empty nodes to make a balanced tree
    // We want from 3-5 lists per level of songs to compare
    // So let's look at log base 3 and log base 5, and set the number of levels
    // ideally between those numbers but at least as large as log base 3
    level3 = Math.floor(Math.log(numSongs) / Math.log(3));
    level5 = Math.floor(Math.log(numSongs) / Math.log(5));
    var numLevels = (level3 > level5) ? level3 : (level3 + 1);

    // Now, we need to find the multiples of 3, 4, and 5 that come closest to the number
    // of songs, without going under and that has the right number of levels
    // Will do this via brute force
    var bestLevels;
    var tempLevels = [];
    var closest = 10 * numSongs; // Some big number
    for (i = 0; i < numLevels; i++)
    {
        tempLevels[i] = 3;
    }

    do 
    {
        var product = ArrayProduct(tempLevels);
        if ((product >= numSongs) && (product - numSongs < closest))
        {
            // OK, this combination is better
            bestLevels = tempLevels.slice();
            closest = product - numSongs;
        }
    }
    while (IncrementArray(tempLevels));

    // OK, now we have the optimal set of numbers to use - let's sort this
    bestLevels.sort();

    // Now, go through the list and start inserting empty nodes according to this configuration
    InsertNodes(songTree, bestLevels, 0);

    // And finally, let's distribute the songs into the leaf nodes according to the last element of bestLevels
    // Since the tree may not be perfectly balanced, we'll need to figure out how many trees will end up 
    // with an extra element
    bestLevels[bestLevels.length - 1] = bestLevels[bestLevels.length - 1] - 1;
    var lineObj = { line: 0, extra: numSongs - ArrayProduct(bestLevels) };
    AddSongsToTree(songTree, lines, lineObj, bestLevels[bestLevels.length - 1]);

    return songTree;
} };

function InsertNodes(songTree, levels, index)
{
    var i;

    // Don't insert the last element of the levels array (that's where individual songs will go)
    if (index >= levels.length - 1)
    {
        return;
    }    

    // OK, insert children
    for (i = 0; i < levels[index]; i++)
    {
        // First set up this child recusively
        var subSongTree = {songList:[], children:[]};
        InsertNodes(subSongTree, levels, index + 1);

        // And now insert as a child into songTree
        songTree.children.push(subSongTree);
    }
}

function InsertLeafSong(songTree, title, artist)
{
    var song = {songList:[{title: "", artist: ""}], children:[]};

    song.songList[0]["title"] = title
    song.songList[0]["artist"] = artist;
    songTree.children.push(song); 
}

function AddSongsToTree(songTree, lines, lineObj, songsPerNode)
{
    var i;

    // If this is a leaf node, then we can add in songs
    if (songTree.children.length == 0)
    {
        var line = lineObj["line"];
        var songsToAdd = songsPerNode;

        // If there are still "extra" songs allowed, then add one extra
        if (lineObj["extra"] > 0)
        {
            songsToAdd++;
            lineObj["extra"]--;
        }

        for (i = 0; i < songsToAdd; i++)
        {
            // Just make sure we're not over
            if (line < lines.length - 1)
            {
                InsertLeafSong(songTree, lines[line], lines[line + 1]);
                line += 2;
            }
        }

        lineObj["line"] = line;
    }
    else
    {
        // Not a leaf - make recursive calls
        for (i = 0; i < songTree.children.length; i++)
        {
            AddSongsToTree(songTree.children[i], lines, lineObj, songsPerNode);
        }
    }
}

function ArrayProduct(arr)
{
    var i;
    var prod = 1;

    for (i = 0; i < arr.length; i++)
    {
        prod = prod * arr[i];
    }

    return prod;
}

function IncrementArray(arr)
{
    var i;
    var j;

    // It's like an n-digit number with digits ranging from 3-5
    // We return true if we can increment the array and false if
    // we can't (e.g. it's all 5's already)
    for (j = arr.length - 1; j >= 0; j--)
    {
        if (arr[j] < 5)
        {
            for (i = j + 1; i < arr.length; i++)
            {
                arr[i] = 3;
            }

            arr[j]++;
            return true;
        }
    }

    // Oops, this is the end
    return false;
}
