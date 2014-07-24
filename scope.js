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

		this.$$watchCollection.push(watchobj);

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

		_.each(this.$$watchCollection, invoke, this);
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



var scope = new Scope();
scope.counter1 = [];
scope.counter2 = 1;

scope.$$postDigest(function() {
	console.log("done");
})

var watchFn = function(scope) {
	console.log("watcher1");
	return sscope.counter1;
};

var watchFn2 = function(scope) {
	console.log("watcher2");
	return scope.counter2;
};

var listenFn = function(newVal, oldVal, scope) {
	scope.$evalAsync(function(scope) {
		console.log("asyncEval");
	});

};

var listenFn2 = function(newVal, oldVal, scope) {
	console.log("listener 2");
};

scope.$watch(watchFn, listenFn);
scope.$watch(watchFn2, listenFn2);
scope.$digest();

scope.$eval(function(scope, arg) {
	// console.log(scope);
	// console.log(arg)
}, 2);

scope.$apply(function(scope) {
	scope.counter1 = 2;
});