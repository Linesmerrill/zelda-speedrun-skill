'use strict';
var Alexa = require('alexa-sdk');
var https = require('https');

var APP_ID = "arn:aws:lambda:us-east-1:400139375123:function:GetNewSpeedrunIntent";

var SKILL_NAME = "Zelda Speedrun";
var GET_SPEEDRUN_MESSAGE = "Here's the current fastest time: ";
var HELP_MESSAGE = "You can say tell me the fastest time, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "How can I help you?";
var STOP_MESSAGE = "Have a great day!";

var data = undefined;
var options = {
  host: 'www.speedrun.com',
  port: 443,
  // path: '/prod/stateresource?usstate=' + encodeURIComponent('New Jersey'),
  path: '/api/v1/games/76rqjqd8/records?top=' + encodeURIComponent("1") + '&miscellaneous=' + encodeURIComponent("false")
  method: 'GET'
}


// request('http://www.speedrun.com/api/v1/games/76rqjqd8/records?top=1&miscellaneous=false', function (error, response, body) {
//   console.log('error:', error); // Print the error if one occurred
//   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//   console.log('body:', body); // Print the HTML for the Google homepage.
//   data = body
// });




exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  rp('http://www.google.com')
      .then(function (htmlString) {
          data = htmlString
          context.succeed();
      })
      .catch(function (err) {
        context.done(null, 'FAILURE');
        console.log("ERROR: ", err)
          // Crawling failed...
      });

      if (data === undefined) {
        data = "39 minutes and 57 seconds"
      }

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
