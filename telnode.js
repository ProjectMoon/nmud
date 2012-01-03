var util = require('util'),
	events = require('events');
	
var ascii = String.fromCharCode;

var reverse = function(obj) {
	var obj2 = {};
	
	for (prop in obj) {
		var value = obj[prop];
		obj2[value] = prop;
	}
	
	return obj2;
}

var forEach = Array.prototype.forEach;

var cmd = {
	SE: ascii(240),
	NOP: ascii(241),
	DM: ascii(242),
	BRK: ascii(243),
	IP: ascii(244),
	AO: ascii(245),
	AYT: ascii(246),
	EC: ascii(247),
	EL: ascii(248),
	GA: ascii(249),
	SB: ascii(250),
	WILL: ascii(251),
	WONT: ascii(252),
	DO: ascii(253),
	DONT: ascii(254),
	IAC: ascii(255)
};

var opt = {
	suppressGoAhead: ascii(3),
	status: ascii(5),
	echo: ascii(1),
	timingMark: ascii(6),
	terminalType: ascii(24),
	windowSize: ascii(31),
	terminalSpeed: ascii(32),
	remoteFlowControl: ascii(33),
	linemode: ascii(34),
	envVariables: ascii(36)
};

var ctrl = {
	NULL: ascii(0),
	LF: ascii(10),
	CR: ascii(13),
	BELL: ascii(7),
	BS: ascii(8),
	HT: ascii(9),
	VT: ascii(11),
	FF: ascii(12)
};

var cmd_reverse = reverse(cmd);
var opt_reverse = reverse(opt);
var ctrl_reverse = reverse(ctrl);

function encode() {
	var buf = new Buffer(arguments.length);
	var i = 0;
	forEach.call(arguments, function(arg) {
		buf.write(arg.toString(), i, 'ascii');
		i++;
	});

	return buf;
}

function subnegotiate() {
	//+4 for IAC SB and IAC SE
	var buf = new Buffer(arguments.length + 4);

	buf.write(cmd.IAC, 0, 'ascii');
	buf.write(cmd.SB, 1, 'ascii');

	var i = 2;
	forEach.call(arguments, function(arg) {
		buf.write(arg.toString(), i, 'ascii');
		i++;
	});

	buf.write(cmd.IAC, i, 'ascii');
	i++;
	buf.write(cmd.SE, i, 'ascii');
	return buf;
}

function decode(buf) {
	var s = '';

	buf_loop:
	for (var c = 0; c < buf.length; c++) {
		var byte = ascii(buf[c]);
		for (entry in cmd) {
			if (byte == cmd[entry]) {
				s += ' ' + entry;
				continue buf_loop;
			}
		}

		for (entry in opt) {
			if (byte == opt[entry]) {
				s += ' ' + entry;
				continue buf_loop;
			}
		}

		for (entry in ctrl) {
			if (byte == ctrl[entry]) {
				s + ' ' + entry;
				continue buf_loop;
			}
		}
	}

	return s.trim();
}

function converse(socket, conversation) {
	function loop(listener, args, i) {
		if (listener != null) socket.removeListener('data', listener);
		var arg = args[i];
		var next = args[i + 1];

		if (typeof(arg) !== 'undefined') {
			var buf = encode.apply(null, arg);
			
			if (typeof(next) !== 'undefined') {
				socket.on('data', function(data) {
					if (data.toString('ascii').indexOf(buf.toString('ascii')) != -1) {
						i += 2;
						loop(arguments.callee, args, i);
					}
				});
			}

			socket.write(buf);
		}
	}
	
	loop(null, conversation, 0);
}

var qstate = {
	Q_NO: 0,
	Q_YES: 1,
	Q_WANTYES_EMPTY: 2,
	Q_WANTNO_EMPTY: 3,
	Q_WANTYES_OPPOSITE: 4,
	Q_WANTNO_OPPOSITE: 5
};

function zero(buf) {
	for (var c = 0; c < buf.length; c++) {
		buf[c] = 0;
	}
}

function qMethodHandler(data) {
	var command = ascii(data[1]);
	var opt = data[2];
	var state = this.getState(opt);
	
	switch (command) {
		case cmd.WILL:
			console.log('will');
			switch (state.server) {
				case qstate.Q_NO:
					this.send(cmd.IAC, cmd.DONT, opt);
					break;
				case qstate.Q_WANTNO_EMPTY:
					//error
					state.server = qstate.Q_NO;
					break;
				case qstate.Q_WANTNO_OPPOSITE:
					//error
					state.server = qstate.Q_YES;
					break;
				case qstate.Q_WANTYES_EMPTY:
					//this.send(cmd.IAC, cmd.DO, opt);
					state.server = qstate.Q_YES;
					break;
				case qstate.Q_WANTYES_OPPOSITE:
					this.send(cmd.IAC, cmd.DONT, opt);
					state.server = qstate.Q_WANTNO_EMPTY;
					break;
			}
			break;
		case cmd.WONT:
			console.log('wont');
			switch (state.server) {
				case qstate.Q_YES:
					this.send(cmd.IAC, cmd.DONT, opt);
					state.server = qstate.Q_NO;
					break;
				case qstate.Q_WANTNO_EMPTY:
					state.server = qstate.Q_NO;
					break;
				case qstate.Q_WANTNO_OPPOSITE:
					this.send(cmd.IAC, cmd.DO, opt);
					state.server = qstate.Q_WANTYES_EMPTY;
					break;
				case qstate.Q_WANTYES_EMPTY:
					state.server = qstate.Q_NO;
					break;
				case qstate.Q_WANTYES_OPPOSITE:
					state.server = qstate.Q_NO;
					break;
			}
			break;
		case cmd.DO:
			console.log('do');
			switch (state.client) {
				case qstate.Q_NO:
					console.log('no');
					this.send(cmd.IAC, cmd.WONT, opt);
					break;
				case qstate.Q_WANTNO_EMPTY:
					//error
					state.client = qstate.Q_NO;
					break;
				case qstate.Q_WANTNO_OPPOSITE:
					//error
					state.client = qstate.Q_YES;
					break;
				case qstate.Q_WANTYES_EMPTY:
					console.log('oh yeah');
					//this.send(cmd.IAC, cmd.WILL, opt);
					state.client = qstate.Q_YES;
					break;
				case qstate.Q_WANTYES_OPPOSITE:
					console.log('want yes opposite');
					this.send(cmd.IAC, cmd.WONT, opt);
					state.client = qstate.Q_WANTNO_EMPTY;
					break;
			}
			break;
		case cmd.DONT:
			console.log('dont');
			switch (state.client) {
				case qstate.Q_YES:
					console.log('yes');
					this.send(cmd.IAC, cmd.WONT, opt);
					state.client = qstate.Q_NO;
					break;
				case qstate.Q_WANTNO_EMPTY:
					console.log('wantnoempty');
					state.client = qstate.Q_NO;
					break;
				case qstate.Q_WANTNO_OPPOSITE:
					console.log('wantnoopp');
					//this.send(cmd.IAC, cmd.WILL, opt);
					state.client = qstate.Q_WANTYES_EMPTY;
					break;
				case qstate.Q_WANTYES_EMPTY:
					console.log('wantyesempty');
					state.client = qstate.Q_NO;
					break;
				case qstate.Q_WANTYES_OPPOSITE:
					console.log('wantyesopp');
					state.client = qstate.Q_NO;
					break;
			}
			break;
	}
	
	console.log('setting state: ' + JSON.stringify(state));
	this.setState(opt, state);
}

function Telnode(socket) {
	this.socket = socket;
	this.optionStates = {}; //opt: { server: ..., client: ... };
	
	var self = this;
	
	socket.on('data', function(data) {
		console.log('got ' + decode(data));
		if (self.getState(opt.echo).client == qstate.Q_YES) {
			self.send(data);
		}
		
		if (ascii(data[0]) === cmd.IAC) {
			self.emit('command', data);
		}
		else {
			self.emit('data', data);
		}
	});
}
util.inherits(Telnode, events.EventEmitter);

Telnode.prototype.send = function() {
	console.log('sending: ' + decode(encode.apply(null, arguments)));
	this.socket.write(encode.apply(null, arguments));
}

Telnode.prototype.enable = function(option) {
	var state = this.getState(option);
	state.client = qstate.Q_WANTYES_EMPTY;
	
	var optKey = encode(option)[0];
	this.setState(optKey, state);
	this.send(cmd.IAC, cmd.WILL, option);
}

Telnode.prototype.disable = function(option) {
	var state = this.getState(option);
	
	switch (state.client) {
		case qstate.Q_YES:
			state.client = qstate.Q_WANTNO_EMPTY;
			this.send(cmd.IAC, cmd.WONT, option);
			break;
		case qstate.Q_WANTNO_EMPTY:
			state.client = qstate.Q_WANTNO_EMPTY;
			break;
		case qstate.Q_WANTYES_EMPTY:
			state.client = qstate.Q_WANTYES_OPPOSITE;
			break;
	}
	
	var optKey = encode(option)[0];
	this.setState(optKey, state);
}

Telnode.prototype.getState = function(opt) {
	var state = this.optionStates[opt];
	
	if (typeof(state) === 'undefined') {
		state = { server: qstate.Q_NO, client: qstate.Q_NO };
		this.optionStates[opt] = state;
	}
	
	return state;
}

Telnode.prototype.setState = function(opt, state) {
	if (typeof(opt) === 'string') {
		throw new TypeError('Option must be encoded');
	}
	this.optionStates[opt] = state;
}

//exports
module.exports.cmd = cmd;
module.exports.opt = opt;
module.exports.ctrl = ctrl;
module.exports.encode = encode;
module.exports.decode = decode;
module.exports.converse = converse;

module.exports.create = function(socket) {
	var tn = new Telnode(socket);
	
	tn.on('command', qMethodHandler);
	
	return tn;
}
