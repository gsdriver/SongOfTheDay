//
// Web interface for Song of the Day
//

"use strict";

const http = require('http');
const querystring = require('querystring');
const songserver = require('./SongServer');

var port = process.env.PORT || 3000;
var host = process.env.HOST || 'localhost';

// Create the server
const server = http.createServer((req, res) => {  
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', "GET, PUT, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // We only support GET
    if (req.method == 'GET')
    {
        if (req.url === "/favicon.ico")
        {
            res.statusCode = 404;
            res.end();
            return;
        }

        // Parse out the querystring to see how they are calling us
        var params = querystring.parse(req.url, "?");

        // We are going to call the Game service to get a JSON representation of the game
        switch (params.action)
        {
            case "getsong":
                songserver.GetSongOfTheDay((error, song) => {
                    if (error)
                    {
                        res.statusCode = 400;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({error: error}));
                    }
                    else
                    {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(song));
                    }
                });
                break;
            case "getresults":
                songserver.GetResults((error, song) => {
                    if (error)
                    {
                        res.statusCode = 400;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({error: error}));
                    }
                    else
                    {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(song));
                    }
                });
                break;
            default:
                // Unknown action
                var err = (params.action) ? ("Received unknown action " + action) : "Did not receive an action";
                console.log(err);
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({error: err}));
                break;
        }
    }
    else
    {
        // We don't support this
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({error: "Only GET is supported"}));
    }
});

server.listen(port, host, () => {
    console.log('Server listening on port ' + host + ':' + port);
});

