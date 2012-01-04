var factory = require('./factory');
	
var player = factory.createPlayer(null, {
	name: 'Derp'
});

player.command('eat the chicken');

var protos = require('./protos');

var trait = {
	__init: function(mudObj) {
		mudObj.test = 5;
	},
	stuff: 10
}

var obj = require('./core').createObject(trait);

console.log(obj.stuff);
console.log(obj.test);
console.log(obj.is(trait));
