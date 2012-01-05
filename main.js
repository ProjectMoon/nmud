var rl = require('readline'),
	transports = require('./transports'),
	factory = require('./factory'),
	world = require('./world'),
	commands = require('./commands');
	
var player = factory.createPlayer({
	name: 'Derp'
});

world.build(require('./sampleworld.json'));

var start = world.getRoom(0);

player.room = start;
player.room.add(player);

var handler = commands.createMobileHandler(player);
handler.defaultAll();

player.on('command', function(cmd) {
	handler(cmd);
});

handler.on('error', function(err) {
	player.emit('invalid', err.message);
});

var t = transports.console(player);
t.connect();
