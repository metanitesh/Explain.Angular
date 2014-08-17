function publishExternalAPI() {

	setupModuleLoader(window);

	ngModule = angular.module('ng', []);
	ngModule.provider('$parse', $ParseProvider);
	ngModule.provider('$rootScope', $RootScopeProvider);
	ngModule.provider('$compile', $CompileProvider);

	ngModule.directive('myEl', function() {
		return {
			compile: function(element) {
				element.data('hasCompiled', true);
			}
		};
	});


	inj = createInjector(['ng']);

	inj.invoke(function($compile) {
		$compile($("<my-el></my-el>"));
	});
	
}

publishExternalAPI();