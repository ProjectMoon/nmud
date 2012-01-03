var uuid = require('node-uuid'),
	util = require('util'),
	compose = require('compose'),
	events = require('events');

var forEach = Array.prototype.forEach;

function MUDObject() {
	this.memid = uuid();
}

util.inherits(MUDObject, events.EventEmitter);

MUDObject.prototype.mixin = function() {
	compose.apply(this, arguments);
}

exports.createObject = function() {
	var obj = new MUDObject;
	
	forEach.call(arguments, function(arg) {
		obj.mixin(arg);
		if (typeof arg.events === 'object') {
			for (var eventName in arg.events) {
				obj.on(eventName, arg.events[eventName]);
			}
		}
	});
	
	return obj;
}
