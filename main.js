
var factory = require('./factory'),
	commands = require('./commands');
	
var player = factory.createPlayer(null, {
	name: 'Derp'
});

player.room = factory.createRoom({
	title: 'A room'
});

var handler = commands.mobileContextHandler(player);
handler('look', function(err, objs, context) {
	if (err) return console.log(err.stack);
	console.log('woop woop', context.executor.name);
});

handler.on('look', function(err, objs, context) {
	//...?
});
