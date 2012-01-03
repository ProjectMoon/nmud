var util = require('util'),
	compose = require('compose'),
	mud = require('./mud'),
	mixins = require('./mixins');
	
exports.room = function(roomProps) {
	var obj = mud.createObject();
	obj.mixin(mixins.Container, roomProps);
	return obj;
};
