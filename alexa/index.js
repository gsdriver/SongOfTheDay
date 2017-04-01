//
// Main handler for Alexa Song of the Day skill
//

'use strict';

const http = require('http');
const Help = require('./intents/Help');
const Stop = require('./intents/Stop');
const Cancel = require('./intents/Cancel');
const utils = require('./utils');

function buildResponse(session, speech, speechSSML, shouldEndSession, reprompt, cardContent) {
  const alexaResponse = {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: speech,
      },
      shouldEndSession: shouldEndSession,
    },
  };

  if (speechSSML) {
    alexaResponse.response.outputSpeech.type = 'SSML';
    alexaResponse.response.outputSpeech.ssml = speechSSML;
  }

  if (session && session.attributes) {
    alexaResponse.sessionAttributes = session.attributes;
  }

  if (cardContent) {
    alexaResponse.response.card = {
        type: 'Simple',
        title: 'Song of the Day',
        content: cardContent,
    };
  }

  // Reprompt is the text Alexa will speak if the user doesn't respond to
  // the prompt in a certain amount of time
  if (reprompt) {
    alexaResponse.response.reprompt = {
      outputSpeech: {
        type: 'PlainText',
        text: reprompt,
        },
    };
  }

  return alexaResponse;
}

function intentResponse(session, context, speechError, speech, speechSSML, reprompt) {
  let response;
  const shouldEndSession = (reprompt ? false : true);

  if (speechError) {
    response = buildResponse(session, speechError, null, shouldEndSession, reprompt);
  } else {
    // Use speech as the card content too
    const cardContent = (speechSSML) ? utils.ssmlToSpeech(speechSSML) : speech;

    response = buildResponse(session, speech, speechSSML, shouldEndSession, reprompt, cardContent);
  }

  context.succeed(response);
}

function onLaunch(request, context, session) {
  utils.getSong(session, (speech, reprompt) => {
    const response = buildResponse(null, speech, null, false, reprompt, speech);
    context.succeed(response);
  });
}

function onSessionEnded(request, context) {
  context.succeed();
}

function onIntent(request, context, session) {
  console.log(request.intent.name + ' with slots ' + JSON.stringify(request.intent.slots));
  switch (request.intent.name) {
    case 'AMAZON.HelpIntent':
      Help.handleIntent(request.intent, session, context, intentResponse);
      break;
    case 'AMAZON.StopIntent':
      Stop.handleIntent(request.intent, session, context, intentResponse);
      break;
    case 'AMAZON.CancelIntent':
      Cancel.handleIntent(request.intent, session, context, intentResponse);
      break;
    case 'VoteExcellentIntent':
    case 'VoteGreatIntent':
    case 'VoteDecentIntent':
    case 'VoteSucksIntent':
    case 'VoteTerribleIntent':
      const voteMapping = {'VoteExcellentIntent': 5, 'VoteGreatIntent': 4,
        'VoteDecentIntent': 3, 'VoteSucksIntent': 2, 'VoteTerribleIntent': 1};
      const vote = voteMapping[request.intent.name];

      intentResponse(session, context, null, 'To be implemented to record a vote of ' + vote, null, null);
      break;
    default:
      console.log('Unknown intent ' + request.intent.name);
      break;
  }
}

exports.handler = function(event, context) {
  try {
    if (!event.session || !event.session.application || !event.session.application.applicationId ||
      (event.session.application.applicationId != 'amzn1.ask.skill.fa911a26-47e2-467b-9d75-3fc8c2ca76a7')) {
      throw new Error('Invalid application ID');
    }

    // Do we have the song of the day yet?  If not, fetch it
    // Create attributes
    if (!event.session.attributes) {
      event.session.attributes = {};
    }

    if ((event.session.attributes.song === undefined) || (event.session.attributes.song === null)) {
      loadSong((err, song) => {
        if (!err) {
          event.session.attributes.song = song;
          console.log('Loaded song ' + JSON.stringify(song));
        }

        switch (event.request.type) {
          case 'LaunchRequest':
            onLaunch(event.request, context, event.session);
            break;
          case 'SessionEndedRequest':
            onSessionEnded(event.request, context);
            break;
          case 'IntentRequest':
            onIntent(event.request, context, event.session);
            break;
        }
      });
    } else {
      // Already loaded, make out call directly
      switch (event.request.type) {
        case 'LaunchRequest':
          onLaunch(event.request, context, event.session);
          break;
        case 'SessionEndedRequest':
          onSessionEnded(event.request, context);
          break;
        case 'IntentRequest':
          onIntent(event.request, context, event.session);
          break;
      }
    }
  } catch(e) {
    console.log('Unexpected exception ' + e);
    context.fail(e);
  }
};

function loadSong(callback) {
  // Call the service to pull the song details
  let req = http.request({hostname: 'sotd-env.gikgqsyvat.us-west-2.elasticbeanstalk.com',
    path: '/song', method: 'GET'}, (res) => {
    if (res.statusCode === 200) {
      // Copy the result into song
      let fulltext = '';
      res.on('data', (data) => {fulltext += data;});
      res.on('end', () => callback(null, JSON.parse(fulltext)));
    } else {
      callback('Problem calling endpoint', null);
    }
  });

  req.end();
  req.on('error', (e) => { callback(e, null); });
}
