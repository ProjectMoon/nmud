var uuid = require('node-uuid'),
	util = require('util'),
	compose = require('compose'),
	events = require('events');

var forEach = Array.prototype.forEach;

function MUDObject() {
	this.memid = uuid();
}

util.inherits(MUDObject, events.EventEmitter);

MUDObject.prototype.mixin = function(trait) {
	compose.call(this, trait);
	if (typeof trait.events === 'object') {
		for (var eventName in trait.events) {
			this.on(eventName, trait.events[eventName]);
		}
	}	
	
	if (typeof trait.__init !== 'undefined') {
		trait.__init(this);
	}
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
