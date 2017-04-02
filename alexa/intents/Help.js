//
// Handles help - which just tells them the song and that they can vote
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function(intent, session, context, callback) {
    // Tell them the song if we have it
    utils.getSong(session, (helpText, reprompt) => {
      callback(session, context, null, helpText, false, reprompt);
    });
  },
};
