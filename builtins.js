module.exports = {
	look: {
		":name": function(mob) {
			console.log(this.name + ' looking at ' + JSON.stringify(mob));
		},
		
		"": function() {
			console.log('looking at nothing');
		}
	},
	get: {
		":item from from :thing": function() {},
		":item from :thing": function() {},
		":item :thing": function() {},
	}
};
