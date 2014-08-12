function setupModuleLoader(window) {

	var ensure = function(obj, name, factory) {
		return obj[name] || (obj[name] = factory());
	};

	var angular = ensure(window, "angular", Object);

	var createModule = function(name, requires, modules) {

		var invokeLater = function(service, method) {
			return function() {
				moduleInstance._invokeQueue.push([service, method, arguments]);
				return moduleInstance;
			};
		};

		var moduleInstance = {
			name: name,
			requires: requires,
			constant: invokeLater('$provide', 'constant'),
			provider: invokeLater('$provide', 'provider'),
			config: invokeLater('$injector', 'invoke'),
			_invokeQueue: []
		};

		modules[name] = moduleInstance;
		return moduleInstance;
	};

	var getModule = function(name, modules) {
		if (modules.hasOwnProperty(name)) {
			return modules[name];
		} else {
			throw "module " + name + " is not available ";
		}
	};

	ensure(angular, 'module', function() {
		window.modules = {};

		return function(name, requires) {
			if (requires) {
				return createModule(name, requires, modules);
			} else {
				return getModule(name, modules);
			}

		};
	});
}

setupModuleLoader(window);
