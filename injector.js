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
		},

		factory: function(key, factoryFn){
			this.provider(key, {$get : factoryFn});
		},

		value: function(key, value){
			this.factory(key, _.constant(value));
		},

		service: function(key, Constructor){
			this.factory(key, function(){
				return instanceInjector.instantiate(Constructor);
			});
		}
	};

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
				var service = providerInjector.get(invokeArgs[0]);
				var method = invokeArgs[1];
				var args = invokeArgs[2];

				// console.log(service, method, args)
				service[method].apply(service, args);

			});
			
			_.forEach(module._runBlock, function(fn){
				instanceInjector.invoke(fn);
			});

		}
	});

	return instanceInjector;
}

