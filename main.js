var rl = require('readline'),
	factory = require('./factory'),
	world = require('./world'),
	commands = require('./commands');
	
var player = factory.createPlayer(null, {
	name: 'Derp'
});

world.build(require('./sampleworld.json'));

var start = world.getRoom(0);

player.room = start;
player.room.add(player);

var handler = commands.createMobileHandler(player);
handler.defaultAll();

player.on('invalid', function() {
	Array.prototype.forEach.call(arguments, function(text) {
		console.log(text);	
	});
	console.log();
	i.prompt();
});

player.on('out', function() {
	Array.prototype.forEach.call(arguments, function(text) {
		console.log(text);	
	});
	console.log();
	i.prompt();
});

var i = rl.createInterface(process.stdin, process.stdout, null);

i.setPrompt('nmud> ');

i.prompt();
i.on('line', function(text) {
	handler(text);
});
