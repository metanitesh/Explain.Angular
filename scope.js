var Scope = util.defClass({
	
	constructor: function() {
		this.$$watchCollection = [];
	},
	
	$watch: function(watchFn, listenFn) {
		var watchobj = {
			watchFn: watchFn,
			listenFn: listenFn
		};

		this.$$watchCollection.push(watchobj);
	},
	
	$digest: function() {
		var newVal;
		var oldVal;
		
		var invoke = function (watcher) {

			newVal = watcher.watchFn(this);
			oldVal = watcher.last;
			
			if(newVal !== oldVal){
				watcher.last = newVal;
				watcher.listenFn(newVal, oldVal, this);
			}
			
		};
		
		_.each(this.$$watchCollection, invoke, this);
		
	}

});



var scope = new Scope();
scope.title = "angular"

watchFn = function(scope) {
	return scope.title;
};
listenFn = function(newVal, oldVal, scope) {
	console.log(newVal, oldVal, scope);
};

scope.$watch(watchFn, listenFn);
scope.$digest();
