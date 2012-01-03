var string_score = require('./string_score');

module.exports.Container = {
	_checkMemids: function() {
		if (!this.hasOwnProperty('memids')) {
			this.memids = {};
		}
	},
	
	add: function(mudObj) {
		this._checkMemids();
		this.memids[mudObj.memid] = mudObj;
	},
	
	remove: function(mudObjOrMemid) {
		this._checkMemids();
		if (mudObj.hasOwnProperty('memid')) {
			return delete this.memids[mudObjOrMemid.memid];
		}
		else {
			//assume it's a memid
			return delete this.memids[mudObjOrMemid];
		}
	},
	
	find: function(name) {
		this._checkMemids();
		
		var highestScore = 0;
		var foundObj = null;
		
		for (var memid in this.memids) {
			var mudObj = this.memids[memid];
			var score = string_score(mudObj.name, name);
			
			if (score != 0 && score > highestScore) {
				foundObj = mudObj;
				highestScore = score;
			}
		}
		
		return foundObj;
	}
};
