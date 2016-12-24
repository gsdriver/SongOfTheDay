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
        res.setHeader('Content-Type', 'application/json');
        if (req.url === "/favicon.ico")
        {
            res.statusCode = 404;
            res.end();
            return;
        }

        // Parse out the querystring to see how they are calling us
        var urlParams = req.url.substring(req.url.indexOf("?") + 1);
        var params = querystring.parse(urlParams);
        console.log(JSON.stringify(params));
        switch (params.action)
        {
            case "getsong":
                songserver.GetSongOfTheDay((error, song) => {
                    if (error)
                    {
                        res.statusCode = 400;
                        res.end(JSON.stringify({error: error}));
                    }
                    else
                    {
                        res.statusCode = 200;
                        res.end(JSON.stringify(song));
                    }
                });
                break;
            case "getresults":
                songserver.GetResults((error, song) => {
                    if (error)
                    {
                        res.statusCode = 400;
                        res.end(JSON.stringify({error: error}));
                    }
                    else
                    {
                        res.statusCode = 200;
                        res.end(JSON.stringify(song));
                    }
                });
                break;
            case "register":
                // We need an access token to proceed
                if (!params.access_token)
                {
                    res.statusCode = 400;
                    res.end(JSON.stringify({error: "Need access_token"}));
                }
                else
                {
                    songserver.RegisterUser(params.access_token, (error) => {
                        if (error)
                        {
                            res.statusCode = 400;
                            res.end(JSON.stringify({error: error}));
                        }
                        else
                        {
                            res.statusCode = 200;
                            res.end();
                        }
                    });
                }
                break;
            case "vote":
                if (!params.access_token)
                {
                    res.statusCode = 400;
                    res.end(JSON.stringify({error: "Need access_token"}));
                }
                else if (!params.date)
                {
                    res.statusCode = 400;
                    res.end(JSON.stringify({error: "Need date parameter"}));
                }
                else if (!params.vote)
                {
                    res.statusCode = 400;
                    res.end(JSON.stringify({error: "Need vote parameter"}));
                }
                else
                {
                    songserver.SubmitVote(params.access_token, params.date, params.vote, (error) => {
                        if (error)
                        {
                            res.statusCode = 400;
                            res.end(JSON.stringify({error: error}));
                        }
                        else
                        {
                            res.statusCode = 200;
                            res.end();
                        }
                    });
                }
                break;
            default:
                // Unknown action
                var err = (params.action) ? ("Received unknown action " + params.action) : "Did not receive an action";
                console.log(err);
                res.statusCode = 400;
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

