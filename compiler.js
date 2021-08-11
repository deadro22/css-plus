const Lexer = require("./lexer");
const Parser = require("./parser");
const Interpreter = require("./interpreter");

module.exports = function (source) {
  const sourceTokens = Lexer.readSource(source);
  const { AST } = Parser.parseContent(sourceTokens);
  const output = Interpreter.run(AST);

  return output;
};
