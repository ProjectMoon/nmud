var factory = require('./factory');
	
var player = factory.createPlayer(null, {
	name: 'Derp'
});

player.command('eat the chicken');

var protos = require('./protos');
