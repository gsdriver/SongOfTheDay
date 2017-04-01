//
// Utility functions
//

'use strict';

module.exports = {
  getSong: function(session, callback) {
    let songText;
    let reprompt;

    if (session.attributes.song) {
      songText = 'Today\'s song is ' + session.attributes.song.title
        + ' by ' + session.attributes.song.artist + '. ' + session.attributes.song.comments;
      reprompt = 'You can vote Excellent, Cool Song, Decent Song, This Sucks, or Terrible.';
      songText += (' ' + reprompt);
    } else {
      songText = 'There was a problem loading today\'s song';
    }

    callback(songText, reprompt);
  },
  ssmlToSpeech: function(ssml) {
      // Just removes the <speak> tags and any pause or audio tags
      // Since that's all we use with SSML
      let speech;

      speech = ssml.replace('<speak>', '');
      speech = speech.replace('</speak>', '');
      speech = extractTag(speech, 'break');
      speech = extractTag(speech, 'audio');

      return speech;
  },
};
