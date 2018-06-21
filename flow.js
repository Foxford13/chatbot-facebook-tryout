const builder = require('botbuilder');
const  { waterFall } = require('./waterfall.js');
const  { beginsWithVowel } = require('./textControl.js');

const adjectives = {
	"silly": {
		item: "silly"
	},
	"lazy": {
		item: "lazy"
	},
	"promiscous": {
		item: "promiscous"
	},
	"lazy": {
		item: "lazy"
	},
}

function botFlowController (connector) {

	const inMemoryStorage = new builder.MemoryBotStorage();

	// This is a dinner reservation bot that uses multiple dialogs to prompt users for input.
	const bot = new builder.UniversalBot(connector, [




		function(session, results){
			// session.dialogData.favoriteInsult = results.response;
			session.beginDialog("askForAdjective");
		},
		// Register in-memory storage
		function (session, results) {
			console.log(results.response);
			session.dialogData.adjective = results.response.entity;
			session.beginDialog(adjectives[results.response.entity].item);
			// let vowel = "a";
			// beginsWithVowel (session.dialogData.adjective);
			// // Process request and display reservation details
			// session.send(`${session.dialogData.userName}! You are ${vowel} ${session.dialogData.adjective} ${session.dialogData.favoriteInsult}`);
			// session.beginDialog('continueInsult');
			// session.endDialog();
		},
		function (session, results) {
			// choiceBranch(session, results);

		},

	]).set('storage', inMemoryStorage); // Register in-memory storage


	waterFall(bot);

	// The dialog stack is cleared and this dialog is invoked when the user enters 'help'.
	bot.dialog('help', function (session, args, next) {
		session.endDialog("This bot allows you to feel insulted at any time of the day. Enjoy");
	})
	.triggerAction({
		matches: /^help$/i,
	});

}







function choiceBranch (session, results) {

	const	response = results.response.entity;
	session.dialogData.continue = results.response.entity;
	if (response  == "no") {
		session.beginDialog('nothingNew');
	} else if (response == "yes") {
		session.beginDialog('mate');

	} else {
		session.beginDialog('callMum');
	}
}


module.exports = {
	botFlowController
}
