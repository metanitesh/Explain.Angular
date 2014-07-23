var Scope = util.defClass({

	constructor: function() {
		this.$$watchCollection = [];
		this.$$lastDirtyWatch = null;
	},

	$watch: function(watchFn, listenFn) {

		var watchobj = {
			watchFn: watchFn,
			listenFn: listenFn || function() {},
			last: Math.random()
		};

		this.$$watchCollection.push(watchobj);
		this.$$lastDirtyWatch = null;
	},



	$digest: function() {
		var ttl = 10;
		var dirty;
		this.$$lastDirtyWatch = null;

		do {
			dirty = this.$$digestonce();
			if (dirty && !(--ttl)) {
				throw ("can not digest more or will explode");
			}
			
		} while (dirty);


	},

	$$digestonce: function() {
		var newVal;
		var oldVal;
		var dirty;
		var invoke = function(watcher) {

			newVal = watcher.watchFn(this);
			oldVal = watcher.last;

			if (newVal !== oldVal) {
				this.$$lastDirtyWatch = watcher;
				watcher.last = newVal;
				watcher.listenFn(newVal, oldVal, this);
				dirty = true;

			} else if(this.$$lastDirtyWatch === watcher){
				return false;
			}

		};

		_.each(this.$$watchCollection, invoke, this);
		return dirty;
	}

});



var scope = new Scope();
scope.counter1 = 0;
scope.counter2 = 0;


var watchFn = function(scope) {
	return scope.counter1;
};

var watchFn2 = function(scope) {
	return scope.counter2;
};

var listenFn = function(newVal, oldVal, scope) {
	console.log("listener 1");
};

var listenFn2 = function(newVal, oldVal, scope) {
	console.log("listener 2");
};

scope.$watch(watchFn, listenFn);
scope.$watch(watchFn2, listenFn2);

scope.$digest();

scope.counter1 = 1;
scope.$digest();