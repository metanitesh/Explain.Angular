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
			return this.text[index + 1];
		} else {
			return false;
		}

	},
	readNumber: function() {
		var number = "";

		while (this.index < this.text.length) {

			var ch = this.text[this.index];
			if (this.isNumber(ch) || ch === '.') {
				number += ch;
			} else {
				break;
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

	lex: function(str) {

		this.text = str;
		while (this.index < this.text.length) {

			this.ch = this.text[this.index];

			if (this.isNumber(this.ch)) {
				this.readNumber();
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
		return this.primary();
	}
});



function parse(exp) {
	var lexer = new Lexer();
	var parser = new Parser(lexer);
	return parser.parse(exp);
}



console.log(parse("0.2232")());