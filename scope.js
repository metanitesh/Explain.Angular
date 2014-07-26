var Scope = util.defClass({

	constructor: function() {
		this.$$watchCollection = [];
		this.$$asyncQueue = [];
		this.$$phase = null;
		this.$$root = this;
		this.$$postDigestQueue = [];
		this.$$children = [];
		this.$$listeners = {};
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
		child.$$listeners = {};
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
		var veryOldVal = 1;
		console.log(this);

		var internalWatchFn = function(scope) {
			newVal = watchFn(scope);

			if (_.isObject(newVal)) {
				if (_.isArray(newVal)) {

					if (!_.isArray(oldVal)) {
						changeCount++;
						oldVal = [];
					}

					if (newVal.length !== oldVal.length) {
						changeCount++;
						oldVal.length = newVal.length;
					}

					_.forEach(newVal, function(newItem, i) {
						if (newItem !== oldVal[i]) {
							changeCount++;
							oldVal[i] = newItem;
						}
					});
				} else {

					if (!_.isObject(oldVal) || _.isArray(oldVal)) {
						changeCount++;
						oldVal = {};
					}

					for (var key in newVal) {
						if (oldVal[key] !== newVal[key]) {
							changeCount++;
							oldVal[key] = newVal[key];
						}
					}

					for (var key in oldVal) {
						if (oldVal.hasOwnProperty(key) && !newVal.hasOwnProperty(key)) {
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
			console.log("from listner", this);
			listnerFn(newVal, veryOldVal, self);
			veryOldVal = _.clone(newVal);
		};

		return this.$watch(internalWatchFn, internalListenFn);
	},

	$on: function(eventName, listener) {
		var listeners = this.$$listeners[eventName];
		if (!listeners) {
			this.$$listeners[eventName] = listeners = [];
		}
		listeners.push(listener);

		return function() {
			var index = listeners.indexOf(listener);
			if (index >= 0) {
				listeners[index] = null;
			}
		};
	},

	$$fireEventOnScope: function(eventName, listenerArgs) {
		
		var listeners = this.$$listeners[eventName] || [];
		var i = 0;

		while (i < listeners.length) {
			if (listeners[i] === null) {
				listeners.splice(i, 1);
			} else {
				listeners[i].apply(null, listenerArgs);
				i++;
			}
		}

		return event;
	},

	$emit: function(eventName) {
		var event = {
			name: eventName
		};
		var listenerArgs = [event].concat(_.rest(arguments));

		
		var scope = this;
		do {
			scope.$$fireEventOnScope(eventName, listenerArgs);
			scope = scope.$parent;
		} while (scope);

		return event;
	},

	$brodcast: function(eventName) {
		var event = {
			name: eventName
		};

		var listenerArgs = [event].concat(_.rest(arguments));

		scope.$$everyScope(function(scope){
			scope.$$fireEventOnScope(eventName, listenerArgs);
			return true;
		});

		return event;
	}

});


var scope = new Scope();
var child = scope.$new();



var listen = function(a) {
	console.log("child")
	console.log(a);
};

var listen2 = function(a) {
	console.log("parent")
	console.log(a)
}


child.$on("yello", listen);
scope.$on("yello", listen2);

scope.$brodcast("yello"); 

// var listen2 = function() {
// 	console.log("2")
// }


// var listen3 = function() {
// 	console.log("3")
// }


// var listen4 = function() {
// 	console.log("4")
// }


// scope.$on("yello", listen2);