function $CompileProvider($provide){

	hasDirectives = [];

	this.$get = function(){

	};

	this.directive = function(name, directiveFactory){

		if(!hasDirectives.hasOwnProperty(name)){
			hasDirectives[name] = [];
		}
		hasDirectives[name].push(directiveFactory);
		$provide.factory( name+'Directive', directiveFactory );
	};
}

$CompileProvider.$inject = ['$provide'];