var rl = require('readline'),
	mongoose = require('mongoose'),
	transports = require('./transports'),
	factory = require('./factory'),
	world = require('./world'),
	commands = require('./commands');

/*	
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
*/

var schemas = require('./schemas');

var room = factory.createRoom({
	title: 'woop',
	exits: {
		north: new mongoose.Types.ObjectId(0)
	}
});

mongoose.connect('mongodb://localhost/nmud');
room.save(function(err) {
	if (err) console.log(err.stack);
	mongoose.connection.close();
});

room.on('woop', function() {
	console.log("woop");
});

room.emit('woop');
