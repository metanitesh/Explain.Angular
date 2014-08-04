function createInjector(modulesToLoad) {

	var instanceCache = {};
	var providerCache = {};
	var loadedModules = {};

	var $provide = {

		constant: function(key, val) {
			instanceCache[key] = val;
		},

		provider: function(key, provider){
			providerCache[key + 'Provider'] = provider;
		}
	};


	function getService(name){
		console.log(name)
		if(instanceCache.hasOwnProperty(name)){
			return instanceCache[name];
		} else if(providerCache.hasOwnProperty(name+'Provider')){
			var provider = providerCache[name+'Provider']
			return invoke(provider.$get, provider);
		}
	}

	function invoke(fn, self) {

		var args = _.map(annotate(fn), function(token) {
			return getService(token);
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

	function instantiate(fn){
		var Parent = _.isArray(fn) ? _.last(fn) : fn;
		var obj = Object.create(Parent.prototype);
		invoke(fn, obj);
		return obj;
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

	console.log(instanceCache);
	console.log(providerCache);

	return {
		has: function(key) {
			return instanceCache.hasOwnProperty(key) || providerCache.hasOwnProperty(key+ 'Provider');
		},
		get: function(key) {
			return getService(key);
		},
		invoke: invoke,
		annotate: annotate,
		instantiate: instantiate
	};
}

var module = angular.module("myApp", []);

module.constant("c", 1);

module.provider("b", {
	$get: function(a){
		return a+100;
	}
});


module.provider("a", {
	$get: function(){
		return 100;
	}
});



var injector = createInjector(["myApp"]);

console.log(injector.get("b"))
