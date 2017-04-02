//
// Handles help - which just tells them the song and that they can vote
//

'use strict';

const utils = require('../utils');
const FB = require('facebook-node');

module.exports = {
  handleIntent: function(intent, session, context, callback) {
    const voteMapping = {'VoteExcellentIntent': 5, 'VoteGreatIntent': 4,
      'VoteDecentIntent': 3, 'VoteSucksIntent': 2, 'VoteTerribleIntent': 1};
    const vote = voteMapping[intent.name];
    let speechError;
    let speech;

    // Check if they have linked their account first
    if (session.user && session.user.accessToken) {
      // Get the ID and name from the access token so we can record the vote
      FB.setAccessToken(session.user.accessToken);

      FB.api('/me', { fields: ['id', 'name'] }, function (res) {
        if (!res || res.error) {
          speechError = 'Sorry, an internal error occurred.';
        } else {
          // TODO: Actually record the vote.
          // For this pass in res.id and session.attributes.song.date to record the vote
          speech = 'Vote recorded, thank you ' + res.name;
        }

        callback(session, context, speechError, speech, false, null);
      });
    } else {
      // We need to show a link card
      speech = 'Please go to your Alexa app and link your account to vote.';
      callback(session, context, speechError, speech, true, null);
    }


  },
};
