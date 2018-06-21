var restify = require('restify');
var builder = require('botbuilder');
var  { waterFall } = require('./waterfall.js')

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 5000, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: "49e440df-615c-4442-b228-251f025987fe",
    appPassword: "zfaxG31]$qjmJYNDBW725*-"
});


// Listen for messages from users
server.post('/api/messages', connector.listen());


var  { botFlowController } = require('./flow.js')
botFlowController(connector);
