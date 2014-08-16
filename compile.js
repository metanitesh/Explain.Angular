function $CompileProvider($provide) {


	var hasDirectives = [];


	getD = function() {
		return hasDirectives;
	}

	this.$get = function($injector) {

		console.log($injector)

		function compile($nodes) {


			return compileNodes($nodes);
		}


		function compileNodes($nodes) {
			_.forEach($nodes, function(node) {
				console.log(node)
				var directives = collectDirectives(node);
				applyDirectivesToNode(directives, node);
			});
		}

		function collectDirectives(node) {
			var directives = [];
			console.log(nodeName(node))
			var normalizedNodeName = camelCase(nodeName(node).toLowerCase());
			console.log(normalizedNodeName)
			addDirective(directives, normalizedNodeName);
			console.log(directives);
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

		function addDirective(directives, name){
			hd = hasDirectives;
			console.log(hasDirectives)

			if (hasDirectives.hasOwnProperty(name)) {
				console.log($injector.get(name + 'Directive'))
				directives.push.apply(directives, $injector.get(name + 'Directive'));
			}
		}

		function applyDirectivesToNode(directives, node) {

			var $compileNode = $(node);
			console.log("apply", $compileNode)
			console.log("apply", directives)
			_.forEach(directives, function(directive) {

				if (directive.compile) {
					console.log(directive.compile)
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
		console.log(hasDirectives)
	};


}

$CompileProvider.$inject = ['$provide'];