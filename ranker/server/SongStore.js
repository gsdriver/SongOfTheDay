const fs = require('fs');
const songfile = 'thelist.txt';
const backupSongFile = 'backup-list.txt';

 /*
  * The song list is stored in a file as follows:
  * All lists of songs are numbered, and the start of the list within the file is denoted by the character "S"
  * Each song is on two lines (title and artist), and the character string "xS" ends the list of songs
  * Then comes a list of children, starting with the character "C"
  * And then this is also a list of songs/children (could be nested)
  * The character string "xC" ends the list of children.
  *
  * For example, consider this JSON:
  * 
  * {
  *      songList: [{ title: "ROUND AND ROUND", artist: "RATT"}],
  *      children: [
  *          { songList: [{ title: "ROCK ME", artist: "GREAT WHITE"}], children: [] }
  *      ]
  *  };
  * 
  * This woudld be coded as:
  *
  * S
  * ROUND AND ROUND
  * RATT
  * xS
  * C
  * S
  * ROCK ME
  * GREAT WHITE
  * xS
  * C
  * xC
  * xC
  */ 

module.exports = {
  GetSongList : function ()
{
    /* 
     * The data structure is a tree - each node in the tree is an object with two
     * fields - songList (a list of sorted songs) and children (child nodes).
     * The parent node is considered the list that each of the child nodes will sort into
     *
     * A node with an empty list is a placeholder indicating how lists will combine
     * to complete the master list
     */

    var data = fs.readFileSync(songfile, "ascii");
    lines = data.split("\n");

    // Trim the \r from each line
    for (i = 0; i < lines.length; i++)
    {
        lines[i] = lines[i].substr(0, lines[i].length - 1);
    }

    var lineNumObj = { id: 0, line: 0 };
    var songList = {};

    // AT SOME POINT THERE SHOULD BE ERROR CHECKING 
    songList["id"] = 0;
    songList["songList"] = ReadSongs(lines, lineNumObj);
    songList["children"] = ReadChildren(lines, lineNumObj);
    return songList;
},
  WriteTreeToFile : function(songList)
{
    var data = "S";

    // First copy the existing file to a backup
    var dataCopy = fs.readFileSync(songfile, "ascii");
    fs.writeFileSync(backupSongFile, dataCopy);

    // Build up the string
    data = WriteSongsToFile(data, songList["songList"]);
    data = WriteChildrenToFile(data, songList["children"]);

    // Strip the first character and last two characters (final return), and add a space
    data = data.substring(1, data.length - 2) + " ";

    // write to the file
    fs.writeFileSync(songfile, data);
} };

function ReadSongs(lines, lineNumObj)
{
    var songList = [];
    lineNum = lineNumObj["line"];

    // First line should just be S
    if (lines[lineNum] != "S") { throw ("Bad line " + lineNum + " " + lines[lineNum] + lines[lineNum].length); }
    lineNum++;

    // Now read until we hit "xS"
    while (lines[lineNum] != "xS")
    {
        var song = {};
        song["title"] = lines[lineNum++];
        song["artist"] = lines[lineNum++];
        songList.push(song);
    }

    // Return the new songList
    lineNum++;
    lineNumObj["line"] = lineNum;
    return songList;
}

// Reads in the children - which is also a list of songs and children!
function ReadChildren(lines, lineNumObj)
{
    var children = [];
    var lineNum = lineNumObj["line"];
    var id = lineNumObj["id"];
     
    // First line should just be C
    if (lines[lineNum] != "C") { throw ("Bad line " + lineNum + " " + lines[lineNum]); }
    lineNum++;

    // Now read until we hit "xC"
    while (lines[lineNum] != "xC")
    {
        var child = {};
        id++;
        lineNumObj["line"] = lineNum;
        lineNumObj["id"] = id;

        // OK, make the recursive calls to ReadSongs and ReadChildren
        child["id"] = id;
        child["songList"] = ReadSongs(lines, lineNumObj);
        child["children"] = ReadChildren(lines, lineNumObj);
        children.push(child);

        lineNum = lineNumObj["line"];
        id = lineNumObj["id"];
    }

    // Return the children
    lineNum++;
    lineNumObj["line"] = lineNum;
    return children;
}


function WriteSongsToFile(data, songList)
{
    var i;

    // First write "S"
    data += "S\r\n";
    
    // Then write each title and artist on a separate line
    if (songList != null)
    {
        for (i = 0; i < songList.length; i++)
        {
            data += songList[i].title + "\r\n";
            data += songList[i].artist + "\r\n";
        }
    }

    // Finally write "xS"
    data += "xS\r\n";
    return data;
}

function WriteChildrenToFile(data, children)
{
    var i;

    // First write "C"
    data += "C\r\n";

    // Then write each song and child list (recursive)
    if (children != null)
    {    
        for (i = 0; i < children.length; i++)
        {
            data = WriteSongsToFile(data, children[i].songList);
            data = WriteChildrenToFile(data, children[i].children);
        }
    }

    // Finally write "xC"
    data += "xC\r\n";
    return data;
}
