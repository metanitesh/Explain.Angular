function $CompileProvider($provide) {


	var hasDirectives = [];

	this.$get = function($injector) {


		function compile($nodes) {
			return compileNodes($nodes);
		}

		function compileNodes($nodes) {
			_.forEach($nodes, function(node) {
				var directives = collectDirectives(node);
				applyDirectivesToNode(directives, node);
				
				if(node.childNodes && node.childNodes.length){
					compileNodes(node.childNodes);
				}
			});
		}

		function collectDirectives(node) {
			var directives = [];
			var normalizedNodeName = camelCase(nodeName(node).toLowerCase());
			addDirective(directives, normalizedNodeName);
			return directives;
		}

		function camelCase(name) {
			return name.replace(/([\:\-\_]+(.))/g,
				function(match, separator, letter, offset) {
					return offset > 0 ? letter.toUpperCase() : letter;
				});
		}

		function nodeName(element) {
			return element.nodeName ? element.nodeName : element[0].nodeName;
		}

		function addDirective(directives, name) {
			
			if (hasDirectives.hasOwnProperty(name)) {
				directives.push.apply(directives, $injector.get(name + 'Directive'));
				
			}
		}

		function applyDirectivesToNode(directives, node) {

			var $compileNode = $(node);
			_.forEach(directives, function(directive) {
				if (directive.compile) {
					directive.compile($compileNode);
				}
			});
		}

		return compile;

	};


	this.directive = function(name, directiveFactory) {


		if (!hasDirectives.hasOwnProperty(name)) {
			hasDirectives[name] = [];
			$provide.factory(name + 'Directive', function($injector) {
				var factories = hasDirectives[name];
				return _.map(factories, $injector.invoke);

			});
		}

		hasDirectives[name].push(directiveFactory);
		
	};
}

$CompileProvider.$inject = ['$provide'];