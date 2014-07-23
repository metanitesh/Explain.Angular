var Scope = util.defClass({
	
	constructor: function() {
		this.$$watchCollection = [];
	},
	
	$watch: function(watchFn, listenFn) {
		var $watchobj = {
			watchFn: watchFn,
			listenFn: listenFn
		};

		this.$$watchCollection.push($watchobj);
	},
	
	$digest: function() {
		this.$$watchCollection.forEach(function($watch) {
			$watch.listenFn();
		});
	}

});



var scope = new Scope();

watchFn = function() {
	console.log("watch");
};
listenFn = function() {
	console.log("listen");
};

scope.$watch(watchFn, listenFn);
scope.$digest();
console.log(scope);