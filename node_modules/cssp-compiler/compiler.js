const Lexer = require("./src/lexer");
const Parser = require("./src/parser");
const Interpreter = require("./src/interpreter");

module.exports = {
  compile: function (source) {
    const sourceTokens = Lexer.readSource(source);
    const { AST } = Parser.parseContent(sourceTokens);
    const output = Interpreter.run(AST);

    return output;
  },
};
