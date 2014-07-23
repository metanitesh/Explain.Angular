var Scope = util.defClass({

	constructor: function() {
		this.$$watchCollection = [];
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
		var dirty = this.$$digestonce();
		if (dirty) {
			this.$digest();
		}
	},

	$$digestonce: function() {
		var newVal;
		var oldVal;
		var dirty;
		var invoke = function(watcher) {

			newVal = watcher.watchFn(this);
			oldVal = watcher.last;

			if (newVal !== oldVal) {
				watcher.last = newVal;
				watcher.listenFn(newVal, oldVal, this);
				dirty = true;

			}

		};

		_.each(this.$$watchCollection, invoke, this);
		return dirty;
	}

});



var scope = new Scope();
scope.title = "angular";


var watchFn = function(scope) {
	return scope.title;
};

var listenFn = function(newVal, oldVal, scope) {
	scope.title = "react";
};

scope.$watch(watchFn, listenFn);
scope.$digest();