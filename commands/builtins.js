var Command = require('./command').Command;

exports.look = new Command({
	command: 'look',
	form: ':thing?',
	types: { thing: 'any' },
	handler: function(objs, context) {
		console.log('lookin sharp,', context.executor.name);
	}
});
