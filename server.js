var net = require('net'),
	player = require('./player'),
	telnode = require('./telnode'),
	world = require('./world');
        
var nRoom = world.room({
	title: 'The North Room',
	description: 'You are in the north room'
});

var mob = require('./mobile').create({
	name: 'human commoner'
});

var mob2 = require('./mobile').create({
	name: 'another human commoner',
});

nRoom.add(mob);
nRoom.add(mob2);

require('./commands').commandTable.merge({
	eat: {
		"": function(bundle) { console.log('eating...'); }
	}
});

var server = net.createServer(function (socket) {
 	/*console.log("spawning new player");
 	var p = player.create(socket);
 	player.init(p);
 	p.room = nRoom;*/
 	
 	var tn = telnode.create(socket);
 	//disable line mode
 	//tn.send(telnode.cmd.IAC, telnode.cmd.WILL, telnode.opt.suppressGoAhead); 	
 	tn.enable(telnode.opt.suppressGoAhead);
 	setTimeout(function() { tn.disable(telnode.opt.suppressGoAhead); }, '3000');
});

server.listen(2312, 'localhost');
