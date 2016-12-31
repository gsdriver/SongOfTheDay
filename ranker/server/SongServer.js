const http = require('http');
var firstread = require('./FirstRead');
var songstore = require('./SongStore');

const hostname = 'localhost'; //'127.0.0.1';
const port = 3000;

// Global tree (loaded at Get)
var fullTree;

// Create the server
const server = http.createServer((req, res) => {  
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', "GET, PUT, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  if (req.method == 'GET')
  {
      // Get the full tree from file
      fullTree = songstore.GetSongList();
      //fullTree = firstread.CreateInitialTree();
      //WriteTreeToFile(fullTree);

      // Now, figure out which tree to return to the client
      subList = GetListToProcess(fullTree);
      if (subList == null)
      {
          // I guess we must be done
          console.log("I believe you're done\r\n");
          subList = fullTree;
      }
      
      // OK, set the response
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(subList));

  }
  else if (req.method == 'POST')
  {
      // They should be giving us new JSON, which we should write to a file
      var fullbody = '';

      console.log("POST received\r\n");
      req.on('data', function(chunk) {
            // append the current chunk of data to the fullBody variable
            fullbody += chunk.toString();
        });

      req.on('end', function() {
          // request ended -> convert the string into a JSON object and save to disk
          try
          {
              if (fullbody.length > 0) {
                  // Get the JSON, prune it, and insert it at the right place in the full list (based on ID)
                  var saveTree = false;
                  var songTree = JSON.parse(fullbody);
                  songTree = PruneSongTree(songTree);
                  
                  // If this tree has the same ID as the full tree, then just use this one
                  if (fullTree.id == songTree.id)
                  {
                      fullTree = songTree;
                      saveTree = true;
                  }
                  else
                  {
                      // Find and replace the tree with this ID; if you don't find it don't save!
                      saveTree = ReplaceSongTreeByID(fullTree, songTree);
                  }

                  if (saveTree)
                  {
                      // Now write the full tree to file
                      songstore.WriteTreeToFile(fullTree);

                      // Success!
                      res.writeHead(200, "OK", {'Content-Type': 'text/html'});
                      res.write('List created');
                      res.end('\n');
                  }
                  else
                  {
                      // Hmm, didn't seem to find it -- write an error          
                      res.writeHead(400, "Bad Request", {'Content-Type': 'text/html'});
                      res.write(err);
                      res.end('\n');               
                  }
              } 
              else 
              {
                  console.log('No data received');
              }
          }
          catch(err)
          {
              // Oops
              res.writeHead(400, "Bad Request", {'Content-Type': 'text/html'});
              res.write(err);
              res.end('\n');
          }
      });
  }
  else
  {
      // We only support GET and PUT right now
      res.statusCode = 403;
      res.setHeader('Content-Type', 'text/plain');
      res.write('Only GET is supported now');
      res.end('\n');
  }
});


server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


function SongsInTree(songTree)
{
    var numSongs;
    var i;

    // The number of songs in a tree is the number of songs in the songlist
    // plus the number of songs in each child tree
    numSongs = songTree.songList.length;
    for (i = 0; i < songTree.children.length; i++)
    {
        numSongs += SongsInTree(songTree.children[i]);
    }

    return numSongs;
}

function PruneSongTree(songTree)
{
    var i;

    // Let's remove any empty leaf nodes (bottom-level nodes should always have things in them)
    for (i = 0; i < songTree.children.length; i++)
    {
        if (songTree.children[i].children.length == 0)
        {
            if (songTree.children[i].songList.length == 0)
            {
                // OK, this child has no songs AND no children so it should be pruned
                songTree.children.splice(i, 1);

                // Decrement i (since we removed this item)
                i--;
            }
        }
        else
        {
            // This node has children so make a recusive call
            PruneSongTree(songTree.children[i]);
        }
    }

    return songTree;
}

function GetListToProcess(songTree)
{
    var subtree = null;
    var i;
    var numSongs;
    var maxSongs = Infinity;
    var listToUse = null;

    // If this list has songs in it AND has children, then you should start here
    // because it means that we were in the process of doing this list
    // If it has no children, pass on this one (it's in a completed node)
    if (songTree.songList.length > 0)
    {
        return ((songTree.children.length > 0) ? songTree : null);
    }

    // OK, this node has no songs in it, so we'll start underneath this node
    // First check if any of the children are better candidates - otherwise we'll 
    // use this node itself
    for (i = 0; i < songTree.children.length; i++)
    {
        // We want to use the list that has the least number of songs
        subtree = GetListToProcess(songTree.children[i]);
        if (subtree != null)
        {
            // OK, use this one
            numSongs = SongsInTree(subtree);
            if (numSongs < maxSongs)
            {
                maxSongs = numSongs;
                listToUse = subtree;
            }
        }
    }

    // If we have a list to use, use it - otherwise we'll just use the list itself
    return ((listToUse == null) ? songTree : listToUse);
}

function ReplaceSongTreeByID(fullTree, songTree)
{
    var i;

    // OK, let's go through the fullTree until we find the node with the same ID as songTree
    if (fullTree.id == songTree.id)
    {
        // That was easy - just replace
        return true;
    }
    else
    {
        // OK, let's go through each child until we find the right ID
        for (i = 0; i < fullTree.children.length; i++)
        {
            if (fullTree.children[i].id == songTree.id)
            {
                // OK, here it is - replace this one in the array and we're done
                fullTree.children[i] = songTree;
                return true;
            }
        }
    }

    // If we didn't find it, make a recursive call
    for (i =0; i < fullTree.children.length; i++)
    {
        if (ReplaceSongTreeByID(fullTree.children[i], songTree))
        {
            return true;
        }
    }

    // Guess we didn't find it
    return false;
}
