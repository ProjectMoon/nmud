var uuid = require('node-uuid'),
	util = require('util'),
	compose = require('compose'),
	events = require('events');

function MUDObject() {
		this.memid = uuid();
}

util.inherits(MUDObject, events.EventEmitter);

MUDObject.prototype.mixin = function() {
	compose.apply(this, arguments);
}

exports.createObject = function() {
	return new MUDObject();
}
