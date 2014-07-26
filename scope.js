var Scope = util.defClass({

	constructor: function() {
		this.$$watchCollection = [];
		this.$$lastDirtyWatch = null;
		this.$$asyncQueue = [];
		this.$$phase = null;
		this.$$root = this;
		this.$$postDigestQueue = [];
		this.$$children = [];
	},

	$watch: function(watchFn, listenFn) {

		var watchobj = {
			watchFn: watchFn,
			listenFn: listenFn || function() {},
			last: Math.random()
		};

		this.$$watchCollection.unshift(watchobj);

		return _.bind(function() {
			var index = this.$$watchCollection.indexOf(watchobj);
			if (index >= 0) {
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

		var dirty;
		var continueLoop = true;


		this.$$everyScope(function(scope) {
			var newVal;
			var oldVal;
			var invoke = function(watcher) {


				try {
					newVal = watcher.watchFn(scope);
					oldVal = watcher.last;

					if (newVal !== oldVal) {
						watcher.last = newVal;
						watcher.listenFn(newVal, oldVal, scope);
						dirty = true;

					}

				} catch (e) {
					console.error(e.message);
				}
			};

			_.forEachRight(scope.$$watchCollection, invoke, this);

			return true
		});



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
			this.$$root.$digest();
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
	},

	$new: function(isolated) {
		console.log(isolated);

		var child;
		if (isolated) {
			child = new Scope();
			child.$$root = this.$$root;
			child.$$asyncQueue = this.$$asyncQueue;
			child.$$postDigestQueue = this.$$postDigestQueue;
		} else {
			child = Object.create(this);
		}

		child.$parent = this;
		child.$$watchCollection = [];
		child.$$children = [];

		this.$$children.push(child);
		return child;
	},

	$destroy: function() {
		if (this === this.$$root) {
			return;
		}

		var index = this.$parent.$$children.indexOf(this);
		if (index >= 0) {
			this.$parent.$$children.splice(index, 1);
		}

	},

	$$everyScope: function(fn) {
		if (fn(this)) {
			this.$$children.forEach(function(child) {
				child.$$everyScope(fn);
			});
		} else {
			return false;
		}
	},

	$watchCollection: function(watchFn, listnerFn) {

		var newVal;
		var oldVal;
		var self = this;
		var changeCount = 0;
		var veryOldValue;
		var firstRun = false;

		var internalWatchFn = function(scope) {
			newVal = watchFn(scope);

			if (_.isObject(newVal)) {
				if (_.isArray(newVal)) {
					
					if(!_.isArray(oldVal)){
						changeCount++;
						oldVal = [];
					}

					if(newVal.length !== oldVal){
						changeCount++;
						oldVal.length = newVal.length;
					}

					_.forEach(newVal, function(newItem, i){
						if(newItem !== oldVal[i]){
							changeCount++;
							oldVal[i] = newItem;
						}
					});
				} else {

					if(!_.isObject(oldVal) || _.isArray(oldVal)){
						changeCounter++;
						oldVal = {};
					}

					for(var key in newVal){
						if(oldVal[key] !== newVal[key]){
							changeCount++;
							oldVal[key] = newVal[key];
						}
					}

					for(var key in oldVal){
						if(oldVal.hasOwnProperty(key) && !newVal.hasOwnProperty(key)){
							changeCount++;
							delete oldVal[key];
						}
					}
				}
			} else {

				if (newVal !== oldVal) {
					changeCount++;
					
				}
				oldVal = newVal;
				
			}

			return changeCount;
		};

		var internalListenFn = function() {

			listnerFn(newVal, veryOldVal, self);
			veryOldVal = _.clone(newVal);
		};

		return this.$watch(internalWatchFn, internalListenFn);
	}

});

var scope = new Scope();
scope.title = "angular";

scope.$watchCollection(function() {
	return scope.title;
}, function(a, b, c) {
	console.log(a,b,c);
})

scope.$digest();
scope.title = "angula2r";

scope.$digest();

// scope.title = "angular";