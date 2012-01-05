var uuid = require('node-uuid'),
	util = require('util'),
	events = require('events');

var forEach = Array.prototype.forEach;

function MUDObject() {
	this.memid = uuid();
	this._eventQueue = {};
}

util.inherits(MUDObject, events.EventEmitter);

MUDObject.prototype.mixin = function(trait) {
	for (var prop in trait) {
		if (prop !== 'events' && prop !== '__init') {
			var desc = Object.getOwnPropertyDescriptor(trait, prop);
			Object.defineProperty(this, prop, desc);
		}
	}
	if (typeof trait.events === 'object') {
		for (var eventName in trait.events) {
			this.on(eventName, trait.events[eventName]);
		}
	}	
	
	if (typeof trait.__init !== 'undefined') {
		trait.__init(this);
	}
}

MUDObject.prototype.queueEvent = function(type, name) {
	if (!(name in this._eventQueue)) {
		this._eventQueue[name] = [];
		this._eventQueue[name].type = type;
	}
	else {
		throw new Error('event "' + name + '" already queued,');
	}
	
	
	var self = this;
	var queue = {
		type: type,
		name: name,
		add: function() {
			self._eventQueue[name].push(Array.prototype.slice.call(arguments));
		},
		
		emit: function() {
			self.completeEvent(this.name);
		}
	};
	
	return queue;
}

MUDObject.prototype.completeEvent = function(nameOrQueue) {
	//allows passing in of either queue objects or the event name.
	if (typeof nameOrQueue === 'object') {
		var name = nameOrQueue.name;
	}
	else {
		var name = nameOrQueue;
	}
	
	if (!(name in this._eventQueue)) {
		throw new Error('event for "' + name + '" not queued.');
	}
	
	var queuedEvents = this._eventQueue[name];
	var self = this;
	queuedEvents.forEach(function(eventArgs) {
		eventArgs.unshift(queuedEvents.type);
		self.emit.apply(self, eventArgs);
	});
}

exports.createObject = function() {
	var obj = new MUDObject;
	var traits = Array.prototype.slice.call(arguments);
	var __init;
		
	traits.forEach(function(trait) {
		obj.mixin(trait);
	});
	
	obj._traits = traits;
	obj.is = function(trait) {
		var hasAllTraits = true;
		
		for (var c = 0; c < arguments.length; c++) {
			var arg = arguments[c];
			hasAllTraits = this._traits.indexOf(arg) !== -1;
			if (!hasAllTraits) return false;
		}
		
		return true;
	};
	
	return obj;
}

exports.MUDObject = MUDObject;
