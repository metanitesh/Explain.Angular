function parse (exp){
	var lexer = new Lexer();
	var parser = new Parser(lexer);
	return parser.parse(exp);
}

var Lexer = util.defClass({
	constructor: function(){

	},

	lex: function(str){
		return str;
	}
});


var Parser = util.defClass({
	constructor: function(lexer){
		this.lexer = lexer;
	},

	parse: function(exp){
		this.token = this.lexer.lex(exp);
		return this.token;
	}
});

console.log(parse("42"));

