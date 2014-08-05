function setupModuleLoader(window) {

	var ensure = function(obj, name, factory) {
		return obj[name] || (obj[name] = factory());
	};

	var angular = ensure(window, "angular", Object);

	var createModule = function(name, requires, modules) {

		var invokeLater = function(method) {
			return function() {
				moduleInstance._invokeQueue.push([method, arguments]);
				return moduleInstance;
			};
		};

		var moduleInstance = {
			name: name,
			requires: requires,
			constant: invokeLater('constant'),
			provider: invokeLater('provider'),
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


// var setupModuleLoader = function(window) {

// 	window.modules = [];

// 	var createModule = function(name, dependencies) {

// 		var moduleInstance = {
// 			name: name,
// 			requires: dependencies,
// 			constant: function() {
// 				this._invokeQueue.push(["constant", arguments]);
// 			},
// 			provider: function() {
// 				this._invokeQueue.push(["provider", arguments]);
// 			},
// 			_invokeQueue: []
// 		};

// 		modules.push(moduleInstance);
// 		return moduleInstance;
// 	};

// 	var ensure = function(obj, prop, factory) {
// 		return obj[prop] || (obj[prop] = factory());
// 	};

// 	ensure(window, 'angular', function() {
// 		return {};
// 	});

// 	ensure(angular, 'module', function() {
// 		return function(name, dependencies) {
// 			return createModule(name, dependencies);
// 		}

// 	})

// }

// setupModuleLoader(window);

// // console.log(angular)

// myApp.constant(1,2,3)
// console.log(myApp)	
// // console.log(modules)