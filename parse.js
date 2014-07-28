var Lexer = util.defClass({
	constructor: function(){

	},

	isNumber : function(ch){
		return '0' <= ch && ch <= '9';
	},

	readNumber: function(){
		var number = "";
		
		while(this.index < this.text.length){

			var ch = this.text[this.index];
			if(this.isNumber(ch)){
				number += ch;
			}else{
				break;
			}
			this.index++;
		}

		number = 1*number;
		
		this.tokens.push({
			text: number,
			fn: _.constant(number)
		});
	},

	lex: function(str){
		this.text = str;
		this.index = 0;
		this.ch = undefined;
		this.tokens = [];

		while(this.index<this.text.length){
			
			this.ch = this.text[this.index];
			if(this.isNumber(this.ch)){
				this.readNumber();
			}else{
				throw "woo";
			}
		}

		return this.tokens;
	}
});


var Parser = util.defClass({
	constructor: function(lexer){
		this.lexer = lexer;
	},

	parse: function(exp){
		return this.lexer.lex(exp);
	}
});



function parse (exp){
	var lexer = new Lexer();
	var parser = new Parser(lexer);
	return parser.parse(exp);
}



console.log(parse("1122")[0].fn());

 