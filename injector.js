function createInjector(modulesToLoad) {

	providerCache = {};
	providerInjector = providerCache.$injector = createInternalInjector(providerCache, function() {
		throw 'unKnown provider ' + path.join(' <-- ');
	});

	instanceCache = {};
	instanceInjector = instanceCache.$injector = createInternalInjector(instanceCache, function(name) {
		var provider = providerInjector.get(name + 'Provider');
		return instanceInjector.invoke(provider.$get, provider);
	});


	var loadedModules = {};
	var INSTANTIATING = {};
	path = [];


	providerCache.$provide = {

		constant: function(key, val) {
			instanceCache[key] = val;
			providerCache[key] = val;
		},

		provider: function(key, provider) {

			if (_.isFunction(provider)) {
				provider = providerInjector.instantiate(provider);
			}

			providerCache[key + 'Provider'] = provider;
		}
	};


	// function getService(name) {
	// 	if (instanceCache.hasOwnProperty(name)) {
	// 		if (instanceCache[name] === INSTANTIATING) {
	// 			throw "cricular dependencies  >" + path.join(">");
	// 		}
	// 		return instanceCache[name];
	// 	} else if (providerCache.hasOwnProperty(name + 'Provider')) {
	// 		path.unshift(name);
	// 		instanceCache[name] = INSTANTIATING;
	// 		var provider = providerCache[name + 'Provider'];
	// 		instanceCache[name] = invoke(provider.$get, provider);
	// 		return instanceCache[name];
	// 	}
	// }



	function annotate(fn) {

		if (_.isArray(fn)) {
			return fn.slice(0, fn.length - 1);
		} else if (fn.$inject) {
			return fn.$inject;
		} else {

			var args = fn.toString().match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m);
			fn.$inject = args[1].split(",");

			return args[1].split(",");

		}

	}

	function createInternalInjector(cache, factoryFn) {

		function getService(name) {
			console.log(cache)
			if (!name) {
				return;
			};

			if (cache.hasOwnProperty(name)) {
				if (cache[name] === INSTANTIATING) {
					throw "circular dependencies" + path.join(" <-- ");
				}
				return cache[name];
			} else {
				path.unshift(name);
				cache[name] = INSTANTIATING;

				return cache[name] = factoryFn(name);
			}
		}

		function invoke(fn, self) {
			var args = _.map(annotate(fn), function(token) {

				return getService(token);
			});

			
			if (_.isArray(fn)) {
				fn = _.last(fn);
			}

			return fn.apply(self, args);
		}

		function instantiate(fn) {
			var Parent = _.isArray(fn) ? _.last(fn) : fn;
			var obj = Object.create(Parent.prototype);
			invoke(fn, obj);
			return obj;
		}

		return {
			has: function(key) {
				return cache.hasOwnProperty(key) || providerCache.hasOwnProperty(key + 'Provider');
			},
			get: function(key) {
				return getService(key);
			},
			invoke: invoke,
			annotate: annotate,
			instantiate: instantiate
		};
	}



	_.forEach(modulesToLoad, function loadModule(moduleName) {
		if (!loadedModules.hasOwnProperty(moduleName)) {

			loadedModules[moduleName] = true;
			var module = angular.module(moduleName);
			_.forEach(module.requires, loadModule);
			_.forEach(module._invokeQueue, function(invokeArgs) {
				var method = invokeArgs[0];
				var args = invokeArgs[1];
				providerCache.$provide[method].apply(providerCache.$provide, args);
			});

		}
	});

	return instanceInjector;
}

var module = angular.module("myApp", []);

module.constant("a", 1);

module.provider("b", function($provide){
	$provide.constant("e", 199);
	this.$get = function(a){
		return a;
	};
});


var injector = createInjector(['myApp'])
console.log(injector.get("b"))
// console.log(providerInjector.get('$provide'))
// console.log("here")
// providerCache.$injector.get()


// console.log(instanceInjector.get('$provide'))

// injector.get("b");


// module.provider("b", {
// 	$get: function() {
// 		return 5;
// 	}
// });

// module.provider("c", {
// 	$get: function(b) {
// 		return b+1;
// 	}
// });

// var injector = createInjector(['myApp'])
// injector.get('c')