
var factory = require('./factory'),
	commands = require('./commands');
	
var player = factory.createPlayer(null, {
	name: 'Derp'
});

player.room = factory.createRoom({
	title: 'A room'
});

commands.addCommand(new commands.Command({
	command: 'optional',
	form: ':stuff? delim :junk',
	types: {
		':stuff?': 'text',
		':junk': 'text'
	}
}));

var handler = commands.createHandler(player.commandContext);

handler.on('optional', function(objs, context) {
	console.log('stuff:', objs.stuff);
	console.log('junk:', objs.junk);
});

handler('optional delim doop');
