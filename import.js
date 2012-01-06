var	mongoose = require('mongoose'),
	world = require('./world');

mongoose.connect('mongodb://localhost/nmud');
console.log('importing', process.argv[2]);
var data = require(process.argv[2]);
world.build(data, function(err) {
	if (err) console.log(err.stack);
	else console.log('world import successful');
	mongoose.connection.close();
});
