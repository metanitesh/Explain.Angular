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


			// console.log(this.text[this.index]);

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

	primary: function() {
		var token = this.tokens[0];
		var primary = token.fn;
		if (token.json) {
			primary.constant = true;
			primary.literal = true;
		}
		return primary;
	},

	parse: function(exp) {
		this.tokens = this.lexer.lex(exp);
		return this.tokens;
	}
});



function parse(exp) {

	var lexer = new Lexer();
	var parser = new Parser(lexer);
	return parser.parse(exp);
}

console.log(parse('"some"123true'));