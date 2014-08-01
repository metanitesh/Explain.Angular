function createInjector(modulesToLoad){
	
	var cache = {};

	var $provide = {
		constant : function(key, val){
			cache[key] = value;
		}
	};

	_.forEach(modulesToLoad, function loadModule(moduleName){
		var module = angular.module(moduleName);
		_.forEach(module.requires, loadModule);
		_.forEach(module._invokeQueue, function(invokeArgs){
			var method = invokeArgs[0];
			var args = invokeArgs[1];
			$provide[method].apply($provide, args);
		});
	});

	return {
		has: function(key){
			return cache.hasOwnProperty(key);
		},
		get: function(key){
			return cache[key];
		}
	};
}

