var Scope = function(){
	this.$$watchCollection = [];
};

Scope.prototype.$watch = function(watchFn, listenFn){
	var $watchobj = {
		watchFn: watchFn,
		listenFn: listenFn
	};

	this.$$watchCollection.push($watchobj);
};

var scope = new Scope();

watchFn = function(){ console.log("watch");};
listenFn = function(){ condole.log("listen");};

scope.$watch(watchFn, listenFn);

console.log(scope);