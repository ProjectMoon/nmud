var Command = require('./command').Command;

exports.look = new Command({
	command: 'look',
	handler: function(objs, context) {
		console.log('lookin sharp,', context.executor.name);
	}
});