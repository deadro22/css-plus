const Lexer = require("./src/lexer");
const Parser = require("./src/parser");
const Interpreter = require("./src/interpreter");

module.exports = class Compiler {
  static compile(source) {
    const sourceTokens = Lexer.readSource(source);
    const { AST } = Parser.parseContent(sourceTokens);
    const output = Interpreter.run(AST);

    return output;
  }
};
