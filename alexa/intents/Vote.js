//
// Handles help - which just tells them the song and that they can vote
//

'use strict';

const utils = require('../utils');
const FB = require('facebook-node');
const request = require('request');

module.exports = {
  handleIntent: function(intent, session, context, callback) {
    const voteMapping = {'VoteExcellentIntent': '5', 'VoteGreatIntent': '4',
      'VoteDecentIntent': '3', 'VoteSucksIntent': '2', 'VoteTerribleIntent': '1'};
    const vote = voteMapping[intent.name];
    let speechError;
    let speech;

    // We need a song date
    if (!session.attributes.song || !session.attributes.song.date) {
      speechError = 'Sorry, I wasn\'t able to load a song to vote on.';
      callback(session, context, speechError, speech, false, null);
    } else {
      // Check if they have linked their account
      if (session.user && session.user.accessToken) {
        // Get the ID and name from the access token so we can record the vote
        FB.setAccessToken(session.user.accessToken);

        FB.api('/me', { fields: ['id', 'name'] }, function (res) {
          if (!res || res.error) {
            speechError = 'Sorry, an internal error occurred.';
          } else {
            recordVote(session.attributes.song.date, res.id, vote, (err, result) => {
              if (err) {
                speechError = 'Sorry, an internal error occurred.';
              } else {
                speech = 'Thank you for your vote, ' + res.name;
              }

              callback(session, context, speechError, speech, false, null);
            });
          }
        });
      } else {
        // We need to show a link card
        speech = 'Please go to your Alexa app and link your account to vote.';
        callback(session, context, speechError, speech, true, null);
      }
    }
  },
};

//
// Internal functions
//

function recordVote(date, id, vote, callback) {
  // Call the service to record the vote
  request.post('http://sotd-env.gikgqsyvat.us-west-2.elasticbeanstalk.com/recordvote',
    { json: {date: date, id: id, vote: vote}}, (err, res, body) => {
    if (err || (res.statusCode != 200)) {
      callback('There was a problem recording your vote', null);
    } else {
      callback(null, JSON.parse(body));
    }
  });
}

