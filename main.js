var factory = require('./factory'),
	commands = require('./commands');
	
var player = factory.createPlayer(null, {
	name: 'Derp'
});

player.room = factory.createRoom({
	title: 'A room'
});

player.room.add(player);

var handler = commands.createHandler(player.commandContext);
handler.defaultAll();

handler.on('optional', function(objs, context) {
	console.log('stuff:', objs.stuff);
	console.log('junk:', objs.junk);
});

handler('look Derp');
