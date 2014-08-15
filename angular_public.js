function publishExternalAPI(){
	
	setupModuleLoader(window);

	ngModule = angular.module('ng', []);
	ngModule.provider('$parse', $ParseProvider);
	ngModule.provider('$rootScope', $RootScopeProvider);

	inj = createInjector(['ng'])
	
}

publishExternalAPI();