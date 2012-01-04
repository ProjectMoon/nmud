 var uuid, forEach, util, compose, events; uuid = require('node-uuid'),
  util = require('util'),
  compose = require('compose'),
  events = require('events');

forEach = Array.prototype.forEach;

function MUDObject() {
  this.memid = uuid();
}

util.inherits(MUDObject, events.EventEmitter);

MUDObject.prototype.mixin = function() {
  compose.apply(this, arguments);
}

exports.createObject = function() {
  var _a, trait, _b, obj, traits, eventName; obj = new MUDObject;
  traits = Array.prototype.slice.call(arguments);

  for(_a = 0, _b = traits.length; _a < _b; _a++) { trait = traits[_a];
    obj.mixin(trait);
    if (typeof trait.events === 'object') {
      for (eventName in trait.events) {
        obj.on(eventName, trait.events[eventName]);
      }
    }
  }

  obj._traits = traits;
  obj.is = function(trait) {
    var _a, arg, _b, hasAllTraits; hasAllTraits = true;

    for(_a = 0, _b = arguments.length; _a < _b; _a++) { arg = arguments[_a];
      hasAllTraits = this._traits.indexOf(arg) !== -1;
      if (!hasAllTraits) return false;
    }

    return true;
  };

  return obj;
}
