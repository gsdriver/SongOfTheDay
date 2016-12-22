//
// Web interface for Song of the Day
//

"use strict";

// HTTP connection
const http = require('http');
const querystring = require('querystring');

var port = process.env.PORT || 3000;
var host = process.env.HOST || 'localhost';

var songserver = require(SongServer);

// Create the server
const server = http.createServer((req, res) => {  
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', "GET, PUT, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // We only support GET and POST
  if (req.method == 'GET')
  {
      // Parse out the querystring to see how they are calling us
      var params = querystring.parse(req.url, "?");
      var action = params.action;
      var userID = params.userID;

      // We are going to call the Game service to get a JSON representation of the game

      gameService.GetGameState(userID, function(error, gameState) {
          // Pass back the error or the game state
          res.setHeader('Content-Type', 'application/json');
          if (error) {
              res.statusCode = 400;                  
              res.end(JSON.stringify({error: error}))
          }
          else {
              // OK, set the response
              res.statusCode = 200;
              res.end(JSON.stringify(gameState));
          }
      });
  }
  else if (req.method == 'POST')
  {
      // POST can only be used if we have an assoicated cookie
      var fullbody = "";

      // For a post, we need to read the form data (in case they have bet information)
      req.on('data', function(chunk) {
            // append the current chunk of data to the fullBody variable
            fullbody += chunk.toString();
        });

      req.on('end', function() {
          // request ended -> let's see if there's a value in there
          try
          {
              // If this is a rules push, then we should send in a new rules object
              var value = null;
              var params = JSON.parse(fullbody);
              var action = params.action;
              var userID = params.userID;

              if (!userID)
              {
                  userID = ParseUserID(req);
              }

              if (action == "suggest")
              {
                  // Different function call - not an action but a request for a suggestion
                  gameService.GetRecommendedAction(userID, function(error, action)
                  {
                      // Write to the console
                      var recommendation = {error: error, suggestion: action};

                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(recommendation));
                  });
              }
              else 
              {    
                  if (action == "setrules")
                  {
                      // value will be a rules object
                      value = params;
                  }
                  else
                  {
                      // Pull the value out (if it exists)
                      value = params.value;
                  }

                  // Do we have a cookie? If not, generate a new one and set it
                  if (userID)
                  {
                      // OK, next action
                      gameService.UserAction(userID, action, value, function(error, gameState)
                      {
                          // If you get "invalid id" error, then clear the cookie
                          if (error == "Invalid ID")
                          {
                              res.setHeader('Set-Cookie', 'BJTutorSession=');
                          }
                          else
                          {
                              if (error)
                              {
                                  res.statusCode = 400;
                                  res.setHeader('Content-Type', 'application/json');
                                  res.end(JSON.stringify({error: error}))    
                              }
                              else
                              {
                                  // OK, set the response
                                  res.statusCode = 200;
                                  res.setHeader('Content-Type', 'application/json');
                                  res.end(JSON.stringify(gameState));
                              }
                          }
                      });
                  }
                  else
                  {
                      // Sorry, we can't do this
                      res.writeHead(400, "Bad Request", {'Content-Type': 'application/json'});
                      res.end(JSON.stringify({error: "No User Cookie found"}));
                  }
              }
          }
          catch(err)
          {
              // Oops - couldn't read the body
              res.writeHead(400, "Bad Request", {'Content-Type': 'application/json'});
              res.end(JSON.stringify({error: "Couldn't read body"}));
          }
      });
  }
  else
  {
      // We don't support this
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({error: "Only GET and PUT are supported"}));
  }
});


server.listen(port, host, () => {
  console.log('Server listening on port ' + host + ':' + port);
});

