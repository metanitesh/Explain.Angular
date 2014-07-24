var Scope = util.defClass({

	constructor: function() {
		this.$$watchCollection = [];
		this.$$lastDirtyWatch = null;
		this.$$asyncQueue = [];
		this.$$phase = null;
		this.$$postDigestQueue = [];
	},

	$watch: function(watchFn, listenFn) {

		var watchobj = {
			watchFn: watchFn,
			listenFn: listenFn || function() {},
			last: Math.random()
		};

		this.$$watchCollection.unshift(watchobj);
		
		return _.bind(function(){
			var index = this.$$watchCollection.indexOf(watchobj);	
			if(index >= 0){
				this.$$watchCollection.splice(index, 1);
			}
		}, this);

	},

	$digest: function() {
		var ttl = 10;
		var dirty;

		this.$beginePhase("$digest");
		do {

			while (this.$$asyncQueue.length) {
				var asyncTask = this.$$asyncQueue.shift();
				asyncTask.scope.$eval(asyncTask.expression);
			}

			dirty = this.$$digestonce();

			if ((dirty || this.$$asyncQueue.length) && !(--ttl)) {
				this.$clearPhase();
				throw ("can not digest more or will explode");
			}

		} while (dirty || this.$$asyncQueue.length);

		this.$clearPhase();

		while (this.$$postDigestQueue.length) {
			this.$$postDigestQueue.shift()();
		}

	},

	$$digestonce: function() {
		var newVal;
		var oldVal;
		var dirty;
		var invoke = function(watcher) {
		
			try {
				newVal = watcher.watchFn(this);
				oldVal = watcher.last;

				if (newVal !== oldVal) {
					watcher.last = newVal;
					watcher.listenFn(newVal, oldVal, this);
					dirty = true;

				}
			} catch(e){
				console.error(e.message);
			}
		};

		_.forEachRight(this.$$watchCollection, invoke, this);
		return dirty;
	},

	$eval: function(exp, locals) {

		return exp(this, locals);
	},

	$apply: function(exp) {
		this.$beginePhase("$apply");
		try {
			return this.$eval(exp);
		} finally {
			this.$clearPhase();
			this.$digest();
		}
	},

	$evalAsync: function(exp) {
		this.$$asyncQueue.push({
			scope: this,
			expression: exp
		});
	},

	$beginePhase: function(phase) {
		if (this.$$phase) {
			throw this.$$phase + "already in progress";
		}
		this.$$phase = phase;
	},

	$clearPhase: function() {
		this.$$phase = null;
	},

	$$postDigest: function(fn) {
		this.$$postDigestQueue.push(fn);
	}

});


