var OPERATORS = {
	'null': _.constant(null),
	'true': _.constant(true),
	'false': _.constant(false)
};

var simpleGetterFn1 = function(key){
	return function(scope){
		return (scope) ? scope[key] : undefined;
	};
};


var setter = function(object, key, value){
	object[key] = value;
	return value;
};

var simpleGetterFn2 = function(key1, key2){

	return function(scope){
		if(!scope){
			return undefined;
		}

		scope = scope[key1];
		return (scope) ? scope[key2] : undefined;
	};
};

var generateGetterFn = function(pathKeys){

	var code = "";

	_.each(pathKeys, function(pathKey){
		code += "if(!scope) {return undefined};\n";
		code += "scope = scope['"+pathKey+"'];\n";
	});

	code+= "return scope;";
	return new Function("scope", code);

};

var getterFn = function(indent){
	var pathKey = indent.split(".");

	if(pathKey.length === 1){
		return simpleGetterFn1(pathKey[0]);
	} else if(pathKey.length === 2){
		return simpleGetterFn2(pathKey[0], pathKey[1]);
	} else {
		return generateGetterFn(pathKey);
	}
};

var Lexer = util.defClass({

	constructor: function() {
		this.text = undefined;
		this.index = 0;
		this.ch = undefined;
		this.tokens = [];
	},

	isNumber: function(ch) {
		return '0' <= ch && ch <= '9';
	},

	peek: function() {
		if (this.index < this.text.length - 1) {
			return this.text[this.index + 1];
		} else {
			return false;
		}

	},

	isExpOperator: function(ch) {
		return (ch === "-") || (ch === "+") || this.isNumber(ch);
	},

	readNumber: function() {
		var number = "";

		while (this.index < this.text.length) {

			var ch = this.text[this.index];
			if (this.isNumber(ch) || ch === '.') {
				number += ch;
			} else {

				if (ch.toLowerCase() === "e") {
					number += ch;
				} else if (this.isExpOperator(ch)) {
					number += ch;
				} else {
					break;
				}
			}
			this.index++;
		}

		number = 1 * number;

		this.tokens.push({
			text: number,
			fn: _.constant(number),
			json: true
		});
	},

	readString: function(quote) {
		this.index++;
		var string = '';
		while (this.index < this.text.length) {

			var ch = this.text[this.index];
			this.index++;

			if (ch === quote) {
				this.tokens.push({
					fn: _.constant(string),
					json: true
				});
				return;
			}

			string = string + ch;
		}

		throw ("unmatched quote");
	},

	isIdentifier: function(ch) {
		return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch === '_') || (ch === '$');
	},

	readIdentifier: function() {
		var string = "";
		while (this.index < this.text.length) {
			var ch = this.text[this.index];


			if (ch === "." || this.isIdentifier(ch) || this.isNumber(ch)) {
				string += ch;
			} else {
				break;
			}

			this.index++;
		}

		var token = {
			text: string
		};


		if (OPERATORS.hasOwnProperty(string)) {
			token.fn = OPERATORS[string];
			token.json = true;
		} else {
			token.fn = getterFn(string);
			token.fn.assign = function(self, value){
				return setter(self, string, value);
			};
		}

		this.tokens.push(token);


	},



	isWhiteSpace: function(ch) {
		return (ch === ' ' || ch === '\r' || ch === '\t' || ch === '\n');
	},

	lex: function(str) {

		this.text = str;
		while (this.index < this.text.length) {

			this.ch = this.text[this.index];

			if (this.isNumber(this.ch)) {
				this.readNumber();
			} else if ((this.ch === '"') || (this.ch === '\'')) {
				this.readString(this.ch);
			} else if (this.isIdentifier(this.ch)) {
				this.readIdentifier();
			} else if (this.isWhiteSpace(this.ch)) {
				this.index++;
			} else if (this.ch === '[' || this.ch === ']' || this.ch === ',' || this.ch === '{' || this.ch === '}' || this.ch === ':', this.ch === '=' ) {
				this.tokens.push({
					text: this.ch,
					json: true
				});

				this.index++;
			} else {
				throw "woo";
			}
		}

		return this.tokens;
	}
});


var Parser = util.defClass({

	constructor: function(lexer) {
		this.lexer = lexer;
		this.tokens = [];
	},

	expect: function(e) {
		var token = this.peek(e);
		if (token) {
			return this.tokens.shift();
		}
	},

	peek: function(e) {
		if (this.tokens.length) {
			if (this.tokens[0].text === e || !e) {
				return this.tokens[0];
			}
		}
	},

	consume: function(e) {
		if (!this.expect(e)) {
			throw "unexpected string";
		}
	},

	primary: function() {
		var primary;



		if (this.expect("[")) {
			primary = this.arrayDeclaration();
		} else if (this.expect("{")) {
			primary = this.object()
		} else {
			var token = this.expect();
			primary = token.fn;

		}
		
		

		return primary;


	},

	
	object: function() {
		var keyValue = [];

		if (!this.peek("}")) {
			do {
				var key = this.primary()();
				this.consume(":");
				this.tokens[0]
				var val = this.primary()();


				keyValue.push({
					key: key,
					val: val
				});

			} while (this.expect(","));
		}

		this.consume("}");


		var objectFn = function() {
			var obj = {};
			_.each(keyValue, function(kv) {
				obj[kv.key] = kv.val;
			});
			return obj;
		};

		return objectFn;
	},
	arrayDeclaration: function() {

		var elementsFns = [];
		if (!this.peek(']')) {
			do {
				elementsFns.push(this.primary());
			} while (this.expect(','));
		}

		this.consume(']');

		return function() {
			return _.map(elementsFns, function(elementFn) {
				return elementFn();
			});
		};
	},

	assignment : function(){
		var left = this.primary();
		console.log(left)
		if(this.expect("=")){
			var right = this.primary();
			console.log("woo")
			return function(scope){
				return left.assign(scope, right(scope));
			}
		}

		return left;
	},

	parse: function(exp) {

		this.tokens = this.lexer.lex(exp);
		// console.log(this.tokens);
		return (this.assignment());
	}
});


function parse(exp) {

	switch (typeof exp) {
		case "string":
			var lexer = new Lexer();
			var parser = new Parser(lexer);
			return parser.parse(exp);
		case "function":
			return exp;
		default:
			return _.noop;
	}
	
}
var a= {foo: 400};

console.log(parse("foo = 20")(a));

console.log(a)

