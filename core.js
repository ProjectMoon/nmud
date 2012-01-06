var uuid = require('node-uuid'),
	util = require('util'),
	events = require('events');

var forEach = Array.prototype.forEach;

function mixin(trait) {
	for (var prop in trait) {
		if (typeof this[prop] === 'undefined') {
			if (prop !== 'events' && prop !== '__init') {
				var desc = Object.getOwnPropertyDescriptor(trait, prop);
				
				if ('get' in desc || 'set' in desc) {
					Object.defineProperty(this, prop, desc);
				}
				else {
					this[prop] = trait[prop];
				}
			}
		}
		else {
			this[prop] = trait[prop];
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

function queueEvent(type, name) {
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
			forEach.call(arguments, function(arg) {
				self._eventQueue[name].push(arg);
			});
		},
		
		emit: function() {
			self.completeEvent(this.name);
		}
	};
	
	return queue;
}

function completeEvent(nameOrQueue) {
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
	queuedEvents.unshift(queuedEvents.type);
	var self = this;
	this.emit.apply(this, queuedEvents);
	delete this._eventQueue[name];
}

function is(trait) {
	var hasAllTraits = true;
	
	for (var c = 0; c < arguments.length; c++) {
		var arg = arguments[c];
		hasAllTraits = this._traits.indexOf(arg) !== -1;
		if (!hasAllTraits) return false;
	}
	
	return true;
}

function ensurePrototype(Schema) {
	Schema.prototype.is = is;
	Schema.prototype.mixin = mixin;
	Schema.prototype.queueEvent = queueEvent;
	Schema.prototype.completeEvent = completeEvent;
}

exports.createObject = function() {
	var traits = Array.prototype.slice.call(arguments);
	var Schema = traits[0];
	ensurePrototype(Schema);
	traits = traits.slice(1);
	
	function MUDObject() {
		this.memid = uuid();
		this._eventQueue = {};
	}
		
	MUDObject.prototype = new Schema;
	var obj = new MUDObject;
		
	traits.forEach(function(trait) {
		if (typeof trait !== 'undefined') {
			obj.mixin(trait);
		}
	});
	
	obj._traits = traits;
	obj._traits.push(Schema);
	
	return obj;
}

