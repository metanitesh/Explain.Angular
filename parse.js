var OPERATORS = {
	'null': _.constant(null),
	'true': _.constant(true),
	'false': _.constant(false)
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


			if (this.isIdentifier(ch) || this.isNumber(ch)) {
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
			} else if (this.ch === '[' || this.ch === ']' || this.ch === ',') {
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

	expect: function(e){
		var token = this.peek(e);
		if(token){
			return this.tokens.shift();
		}
	},

	peek : function(e){
		if(this.tokens.length){
			if(this.tokens[0].text === e || !e){
				return this.tokens[0];
			}
		}
	},

	consume: function(e){
		if(!this.expect(e)){
			throw "unexpected string";
		}
	},

	primary: function(){
		var primary;

		if(this.expect("[")){

			primary = this.arrayDeclaration();
		}else{
			var token = this.expect();
			primary = token.fn;
			
		}
		return primary;
		
		
	},

	arrayDeclaration: function(){

		var elementsFns = [];
		if(!this.peek(']')){
			do{
				elementsFns.push(this.primary());
			} while (this.expect(','));
		}

		this.consume(']');

		return function(){
			return _.map(elementsFns, function(elementFn){
				return elementFn();
			});
		};
	

	},

	parse: function(exp) {
		this.tokens = this.lexer.lex(exp);
		return (this.primary());
	}
});



function parse(exp) {

	var lexer = new Lexer();
	var parser = new Parser(lexer);

	return parser.parse(exp);
}

console.log(parse('[1,2,3,4, [1,3]]')());	