function $CompileProvider($provide) {


	hasDirectives = [];

	this.$get = function() {
		return "helloD";
	};

	getme = function(){
		return hasDirectives;
	}

	this.directive = function(name, directiveFactory) {


		if (!hasDirectives.hasOwnProperty(name)) {
			hasDirectives[name] = [];
			$provide.factory(name + 'Directive', function($injector) {
				var factories = hasDirectives[name];
				return _.map(factories, $injector.invoke);

			});
		}


		hasDirectives[name].push(directiveFactory);
		console.log(hasDirectives)
	};


}

$CompileProvider.$inject = ['$provide'];