var builder = require('botbuilder');


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
	"friendly": {
		item: "friendly"
	},
}

var dinnerMenu = {
	//...other menu items...,
	"Burger": {
		Description: "burger",
		Price: 5 // Order total. Updated as items are added to order.
	},
	"Chips": {
		Description: "chips",
		Price: 1 // Order total. Updated as items are added to order.
	},
	"Pint": {
		Description: "pint",
		Price: 2 // Order total. Updated as items are added to order.
	},
	"Check out": {
		Description: "Check out",
		Price: 0 // Order total. Updated as items are added to order.
	},
};



function initiateDialog (bot, dialogTitle, text) {

	return bot.dialog(dialogTitle, [
		function (session) {
			builder.Prompts.text(session, text);
		},
		function (session, results) {
			session.endDialogWithResult(results);
		}
	])
}

function waterFall (bot) {

	// Dialog to ask for the reservation name.
	initiateDialog(bot, 'goodDay', 'Having a good day?');

	// Dialog to ask for number of people in the party
	initiateDialog(bot, 'askFavoriteColor', 'What is your favorite  color').beginDialogAction('insultHelpAction', 'talkHelp', { matches: /^help$/i });

	initiateDialog(bot, 'nothingNew', 'there is nothing new');

	initiateDialog(bot, 'mate', 'I knew you like it');

	initiateDialog(bot, 'callMum', 'Initiate call Mum Procedure').triggerAction({
		matches: /^call mum$/i,
		confirmPrompt: "I will call your mum. you sure"
	});

	// Context Help dialog for party size
	bot.dialog('talkHelp', function(session, args, next) {
		var msg = "It can be anything im not picky";
		session.endDialog(msg);
	})


	bot.dialog('continueInsult', [
		function (session) {
			builder.Prompts.choice(session, "Would you like to contine the instults?", "yes|no|call my mum", { listStyle: builder.ListStyle.button })
		},
		function (session, results) {
			session.endDialogWithResult(results);
		},
	]);

	bot.dialog("askForAdjective", [
		function(session){
			builder.Prompts.choice(session, "Your favorite adjective:", adjectives);
		},
	])
	.triggerAction({
		// The user can request this at any time.
		// Once triggered, it clears the stack and prompts the main menu again.
		matches: /^adjectives$/i,
		confirmPrompt: "This will cancel your request. Are you sure?"
	});

	// Menu: "Order dinner"
	// This dialog allows user to order dinner to be delivered to their hotel room.
	// This dialog allows user to order dinner and have it delivered to their room.
	bot.dialog('silly', [
		function(session){
			session.send("Lets order some dinner!");
			session.beginDialog("addDinnerItem");
		},
		function (session, results) {
			if (results.response) {
				// Display itemize order with price total.
				for(var i = 1; i < session.conversationData.orders.length; i++){
					session.send(`You ordered: ${session.conversationData.orders[i].Description} for a total of $${session.conversationData.orders[i].Price}.`);
				}
				session.send(`Your total is: $${session.conversationData.orders[0].Price}`);

				// Continue with the check out process.
				builder.Prompts.text(session, "What is your room number?");
			}
		},
		function(session, results){
			if(results.response){
				session.dialogData.room = results.response;
				var msg = `Thank you. Your order will be delivered to room #${results.response}`;
				session.send(msg);
				session.replaceDialog("mainMenu");
			}
		}
	]).reloadAction(
		"restartOrderDinner", "Ok. Let's start over.",
		{
			matches: /^start over$/i
		}
	)
	.cancelAction(
		"cancelOrder", "Type 'Main Menu' to continue.",
		{
			matches: /^cancel$/i,
			confirmPrompt: "This will cancel your order. Are you sure?"
		}
	);
	bot.dialog("mainMenu", [
	    function(session){
	        builder.Prompts.choice(session, "Main Menu:", adjectives);
	    },
	    function(session, results){
	        if(results.response){
	            session.beginDialog(adjectives[results.response.entity].item);
	        }
	    }
	])
	.triggerAction({
	    // The user can request this at any time.
	    // Once triggered, it clears the stack and prompts the main menu again.
	    matches: /^main menu$/i,
	    confirmPrompt: "This will cancel your request. Are you sure?"
	});

	bot.dialog("addDinnerItem", [
		function(session, args){
			if(args && args.reprompt){
				session.send("What else would you like to have for dinner tonight?");
			}
			else{
				// New order
				// Using the conversationData to store the orders
				session.conversationData.orders = new Array();
				session.conversationData.orders.push({
					Description: "Check out",
					Price: 0
				})
			}
			builder.Prompts.choice(session, "Dinner menu:", dinnerMenu);
		},
		function(session, results){
			if(results.response){
				if(results.response.entity.match(/^check out$/i)){
					session.endDialog("Checking out...");
				}
				else {
					var order = dinnerMenu[results.response.entity];
					session.conversationData.orders[0].Price += order.Price; // Add to total.
					var msg = `You ordered: ${order.Description} for a total of $${order.Price}.`;
					session.send(msg);
					session.conversationData.orders.push(order);
					session.replaceDialog("addDinnerItem", { reprompt: true }); // Repeat dinner menu
				}
			}
		}
	])
	.reloadAction(
		"restartOrderDinner", "Ok. Let's start over.",
		{
			matches: /^start over$/i
		}
	);



}

module.exports = {
	waterFall,
}
