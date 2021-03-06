var string_score = require('./string_score');

module.exports = {
	_checkMemids: function() {
		if (!this.hasOwnProperty('memids')) {
			this.memids = {};
		}
	},
	
	canStore: function(obj) {
		return true;
	},
	
	add: function(mudObj) {
		this._checkMemids();
		if (this.canStore(mudObj)) {
			this.memids[mudObj.memid] = mudObj;
		}
		else {
			throw new Error('container cannot store ' + mudObj);
		}
	},
	
	remove: function(mudObjOrMemid) {
		this._checkMemids();
		if (mudObjOrMemid.hasOwnProperty('memid')) {
			return delete this.memids[mudObjOrMemid.memid];
		}
		else {
			//assume it's a memid
			return delete this.memids[mudObjOrMemid];
		}
	},
	
	find: function(name, type) {
		if (!name) return null;
		this._checkMemids();
		
		var highestScore = 0;
		var foundObj = null;
		
		for (var memid in this.memids) {
			var mudObj = this.memids[memid];
			var score = string_score(mudObj.name, name);
			
			if (score != 0 && score > highestScore) {
				if (typeof type !== 'undefined') {
					if (mubObj.is(type)) {
						foundObj = mudObj;
						highestScore = score;
					}
				}
				else {
					foundObj = mudObj;
					highestScore = score;
				}
			}
		}
		
		return foundObj;
	}
};
