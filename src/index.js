'use strict';
var Alexa = require('alexa-sdk');
var http = require('http');

var APP_ID = "arn:aws:lambda:us-east-1:400139375123:function:GetNewSpeedrunIntent";

var SKILL_NAME = "zelda speedrun";
var GET_SPEEDRUN_MESSAGE = "Here's the current fastest time: ";
var HELP_MESSAGE = "You can say tell me the fastest time, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "How can I help you?";
var STOP_MESSAGE = "Have a great day!";

var data = 2397;
var cached_data = 2397;
var options = {
  host: 'www.speedrun.com',
  path: '/api/v1/games/76rqjqd8/records?top=' + encodeURIComponent("1") + '&miscellaneous=' + encodeURIComponent("false")
}


exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);


  callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
    cached_data = str
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    var parsedData = data.split("[")[4]
    var keyValue = parsedData.split(",")[6]
    var time = keyValue.split(":")[1]
    data = time
  });
}

http.request(options, callback).end();
    if (data != cached_data) {
      if (data === undefined) {
        data = cached_data
        http.request(options, callback).end();
        if (data === undefined) {
          data = cached_data
        }
      }
    } else {
      data = cached_data
    }

    /* Async problems so for now setting data to a static value */
    data = 2397

    /* Converts seconds to formatted string */
    var minutes = Math.floor(data / 60);
    var seconds = data - minutes * 60;
    data = minutes.toString() + " minutes and " + seconds.toString() + " seconds"

  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

var handlers = {
  'LaunchRequest': function () {
    this.emit('GetNewSpeedrunIntent');
  },
  'GetNewSpeedrunIntent': function () {
    var speechOutput = GET_SPEEDRUN_MESSAGE + data;
    this.emit(':tellWithCard', speechOutput, SKILL_NAME, data)
  },
  'AMAZON.HelpIntent': function () {
    var speechOutput = HELP_MESSAGE;
    var reprompt = HELP_REPROMPT;
    this.emit(':ask', speechOutput, reprompt);
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', STOP_MESSAGE);
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', STOP_MESSAGE);
  },
  'Unhandled': function() {
    this.emit('GetNewSpeedrunIntent');
    this.emit(':ask', 'An error occured');
  },
};
