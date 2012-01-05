var	world = require('../world'),
	Command = require('./command').Command;

exports.look = new Command({
	command: 'look',
	form: ':thing?',
	types: { thing: 'any' },
	handler: function(objs, context) {
		context.executor.emit('out', 'lookin sharp, ' + context.executor.name);
	}
});

exports.move = new Command({
	command: 'move',
	form: ':direction',
	handler: function(objs, context) {
		var direction = objs.direction;
		var room = context.room;
		
		if (!(direction in room.exits)) {
			return context.executor.emit('invalid', 'You cannot go ' + direction);
		}
		
		var newRoom = world.getRoom(room.exits[direction]);	
		context.executor.move(newRoom);
		
		var q = context.executor.queueEvent('out', 'move');
		q.add('You move ' + direction);
		q.add(newRoom.title);
		q.add(newRoom.description);
		q.emit();
	}
});
