function createInjector(modulesToLoad) {

	var cache = {};
	loadedModules = {};

	var $provide = {
		constant: function(key, val) {
			cache[key] = val;
		}
	};

	function invoke(fn, self) {
		
		var args = _.map(fn.$inject, function(token) {
			return cache[token];
		});

		return fn.apply(self, args);
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
		invoke: invoke
	};
}

angular.module("myApp", []);
console.log(angular.module("myApp"));

angular.module("myApp").constant("a", 1);
angular.module("myApp").constant("b", 2);
angular.module("myApp").constant("name", "nitesh");

var fn = function(a, b) {
	return a + b;
};

fn.$inject = ["name", "a"];
var inject = createInjector(["myApp"]);

console.log(inject.invoke(fn));