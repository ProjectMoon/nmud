var factory = require('./factory'),
	commands = require('./commands');
	
var player = factory.createPlayer(null, {
	name: 'Derp'
});

player.room = factory.createRoom({
	title: 'A room'
});

commands.registerCommand({
	command: 'optional',
	form: ':stuff? delim :junk',
	cascade: 'LTR'
});

var handler = commands.createHandler(player.commandContext);

handler.on('optional', function(objs, context) {
	console.log('stuff:', objs.stuff);
	console.log('junk:', objs.junk);
});

handler('optional asdf delim doop');
