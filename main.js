
var factory = require('./factory'),
	commands = require('./commands');
	
var player = factory.createPlayer(null, {
	name: 'Derp'
});

player.room = factory.createRoom({
	title: 'A room'
});


var look = new commands.Command({
	command: 'look',
	handler: function(objs, context, callback) {
		console.log('lookin\' sharp, ' + context.executor.name);
	}
});

var handler = look.mobileContextHandler(player);
handler('look', function(err) {
	console.log(err);
});


//player.move({});
