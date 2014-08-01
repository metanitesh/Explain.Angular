function createInjector(modulesToLoad) {

	var cache = {};
	loadedModules = {};

	var $provide = {
		constant: function(key, val) {
			cache[key] = val;
		}
	};

	function invoke(fn, self) {
		

		var args = _.map(annotate(fn), function(token) {
			return cache[token];
		});

		if(_.isArray(fn)){
			fn = _.last(fn);
		}

		return fn.apply(self, args);
	}

	function annotate(fn){
		
		if(_.isArray(fn)){
			return fn.slice(0, fn.length-1);
		} else if(fn.$inject){
			return fn.$inject;
		} else {

			var args = fn.toString().match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m);
			fn.$inject = args[1].split(",");

			return args[1].split(",");
			
		}
		
	}

	_.forEach(modulesToLoad, function loadModule(moduleName) {
		if (!loadedModules.hasOwnProperty(moduleName)) {

			loadedModules[moduleName] = true;
			var module = angular.module(moduleName);
			_.forEach(module.requires, loadModule);
			_.forEach(module._invokeQueue, function(invokeArgs) {
				var method = invokeArgs[0];
				var args = invokeArgs[1];
				$provide[method].apply($provide, args);
			});

		}
	});

	console.log(cache);
	console.log(loadedModules);

	return {
		has: function(key) {
			return cache.hasOwnProperty(key);
		},
		get: function(key) {
			return cache[key];
		},
		invoke: invoke,
		annotate: annotate
	};
}

angular.module("myApp", []);
console.log(angular.module("myApp"));

angular.module("myApp").constant("a", 1);
angular.module("myApp").constant("b", 2);
angular.module("myApp").constant("name", "nitesh");

var fn = function(name,a) {
	return name + a;
};


var inject = createInjector(["myApp"]);
console.log(inject.invoke(["name", "a", fn]));