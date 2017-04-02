//
// Handles stop, which will exit the skill
//

'use strict';

module.exports = {
  handleIntent: function(intent, session, context, callback) {
    callback(session, context, 'Thanks for listening. Goodbye.', null, false, null);
  },
};
