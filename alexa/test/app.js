var mainApp = require('../index');

function BuildEvent(argv)
{
  // Templates that can fill in the intent
  var help = {'name': 'AMAZON.HelpIntent', 'slots': {}};
  var stop = {'name': 'AMAZON.StopIntent', 'slots': {}};
  var cancel = {'name': 'AMAZON.CancelIntent', 'slots': {}};
  var voteGreat = {'name': 'VoteGreatIntent', 'slots': {}};

  var lambda = {
    "session": {
      "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
      "application": {
        "applicationId": "amzn1.ask.skill.fa911a26-47e2-467b-9d75-3fc8c2ca76a7"
      },
      "attributes": {},
      //"attributes": {"song":{"date":"2017-03-31","title":"CRAZY ON YOU","artist":"HEART","comments":"This song is featured on Guitar Hero, which of course I am an expert at."}},
      "user": {
          "userId": "amzn1.ask.account.AGZKAFFHJJ54RQE4FKPXH3I5SU2QLHMROEHH4IXWTCADH7CZMD7LJ5NJ2MQ7QUC53ML2BY47X6TS6ZIRMNXEJLTY7VCVZTDPJH5RATRKMEIFN5JIFG63OQDW2WONCAWX3RESZHYK3T4LVWNJQYU5OJI75A7GBTDBVRJBD3BZXSQAQ3P7CPJ5SDW3OZKH4RDQCO2ILBKQGVSJYPI",
          "accessToken": "EAAYKwPzr298BAHcyFaPGYlWBY2XjZBPMqF366zP8J2ZCGZCptOPbAJAe5BIjGn29YLaiPZB26qaMWBIrCy20OYXubwg9mSo1Yd2UsSC7GzRGzySjp2dQzxZB9bUkqIcQ6aROg0XlK2M3F41yiZC8eKEZBr05gZBc2ZCsZD"
      },
      "new": true
    },
    "request": {
      "type": "IntentRequest",
      "requestId": "EdwRequestId.26405959-e350-4dc0-8980-14cdc9a4e921",
      "locale": "en-US",
      "timestamp": "2016-11-03T21:31:08Z",
      "intent": {}
    },
    "version": "1.0"
  };

  var openEvent = {
    "session": {
      "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
      "application": {
        "applicationId": "amzn1.ask.skill.fa911a26-47e2-467b-9d75-3fc8c2ca76a7"
      },
      "attributes": {},
      "user": {
        "userId": "amzn1.ask.account.AFLJ3RYNI3X6MQMX4KVH52CZKDSI6PMWCQWRBHSPJJPR2MKGDNJHW36XF2ET6I2BFUDRKH3SR2ACZ5VCRLXLGJFBTQGY4RNYZA763JED57USTK6F7IRYT6KR3XYO2ZTKK55OM6ID2WQXQKKXJCYMWXQ74YXREHVTQ3VUD5QHYBJTKHDDH5R4ALQAGIQKPFL52A3HQ377WNCCHYI"
      },
      "new": true
    },
    "request": {
      "type": "LaunchRequest",
      "requestId": "EdwRequestId.26405959-e350-4dc0-8980-14cdc9a4e921",
      "locale": "en-US",
      "timestamp": "2016-11-03T21:31:08Z",
      "intent": {}
    },
    "version": "1.0"
  };

  // If there is no argument, then we'll just return
  if (argv.length <= 2) {
    console.log('I need some parameters');
    return null;
  } else if (argv[2] == 'launch') {
    return openEvent;
  } else if (argv[2] == 'votegreat') {
    lambda.request.intent = voteGreat;
  } else if (argv[2] == 'help') {
    lambda.request.intent = help;
  } else if (argv[2] == 'stop') {
    lambda.request.intent = stop;
  } else if (argv[2] == 'cancel') {
    lambda.request.intent = cancel;
  }
  else {
    console.log(argv[2] + ' was not valid');
    return null;
  }

  return lambda;
}

// Simple response - just print out what I'm given
function myResponse(appId) {
  this._appId = appId;
}

myResponse.succeed = function(result) {
  if (result.response.outputSpeech.ssml) {
    console.log('AS SSML: ' + result.response.outputSpeech.ssml);
  } else {
    console.log(result.response.outputSpeech.text);
  }
  if (result.response.card && result.response.card.content) {
    console.log('Card Content: ' + result.response.card.content);
  }
  console.log('The session ' + ((!result.response.shouldEndSession) ? 'stays open.' : 'closes.'));
  if (result.sessionAttributes) {
    console.log('Attributes: ' + JSON.stringify(result.sessionAttributes));
  }
}

myResponse.fail = function(e) {
  console.log(e);
}

// Build the event object and call the app
var event = BuildEvent(process.argv);
if (event) {
    mainApp.handler(event, myResponse);
}