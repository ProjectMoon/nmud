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
	var traits = Array.prototype.slice.call(arguments);
		
	traits.forEach(function(trait) {
		obj.mixin(trait);
		if (typeof trait.events === 'object') {
			for (var eventName in trait.events) {
				obj.on(eventName, trait.events[eventName]);
			}
		}
	});
	
	obj._traits = traits;
	obj.is = function(trait) {
		var hasAllTraits = true;
		
		for (var c = 0; c < arguments.length; c++) {
			var arg = arguments[c];
			hasAllTraits = @_traits.indexOf(arg) !== -1;
			if (!hasAllTraits) return false;
		}
		
		return true;
	};
	
	return obj;
}
