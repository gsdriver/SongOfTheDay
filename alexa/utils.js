//
// Utility functions
//

'use strict';

module.exports = {
  getSong: function(session, callback) {
    let songText;
    let reprompt;
    let isLinked = false;

    if (session.attributes.song) {
      songText = 'Today\'s song is ' + session.attributes.song.title
        + ' by ' + session.attributes.song.artist + '. ' + session.attributes.song.comments;

      if (session.user && session.user.accessToken) {
        isLinked = true;
        reprompt = 'You can vote Excellent, Cool Song, Decent Song, This Sucks, or Terrible.';
      } else {
        reprompt = 'Link your account in the Alexa app to place a vote.';
      }

      songText += (' ' + reprompt);
    } else {
      songText = 'There was a problem loading today\'s song';
    }

    callback(songText, reprompt, isLinked);
  },
};
