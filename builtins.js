var commands = require('./commands');

var look = new Command({
	command: 'look',
	handler: function(objs, context, callback) {
		console.log('lookin\' sharp, ' + context.executor.name);
	}
});
