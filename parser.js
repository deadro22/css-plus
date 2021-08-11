const {
  CsspVariableNode,
  CsspMain,
  CsspTemplateNode,
  CsspPropStyleNode,
  CsspTemplateCallNode,
  CsspSelectorNode,
} = require("./nodes");
const { CsspDictionary } = require("./tokens");

class CsspParser {
  constructor(source) {
    this.TOKENS = [];
    this.token = null;
    this.col = -1;
    this.tokenIndex = 0;
    this.line = 1;
    this.source = source;
    this.AST = new CsspMain("StyleSheet", []);
    this.next();
  }

  static parseContent(source) {
    return new CsspParser(source).parse();
  }

  next() {
    this.token = this.source[this.tokenIndex];
    this.tokenIndex += 1;

    this.col += 1;

    if (!this.token) {
      this.token = null;
    }
  }

  parse() {
    this._fromExpression(this.AST.children);

    return { AST: this.AST, done: true };
  }

  _fromExpression(p) {
    let res = p;

    while (this.token !== null) {
      switch (true) {
        case this.token.type === CsspDictionary.Types.VAR_NAME:
          res.push(this.variableDeclarationNode());
          break;
        case this.token.type === CsspDictionary.Types.TEMP_DEF:
          res.push(this.templateNode());
          break;
        case this.token.type === CsspDictionary.Types.SELECTOR:
          res.push(this.styleNode(true));
          break;
        default:
          throw new Error("Unexpected token " + JSON.stringify(this.token));
      }
    }

    return res;
  }

  templateNode() {
    let res = new CsspTemplateNode(this.token.value, []);
    this.next();
    res.children = this._stylePropExpression(res.children);
    if (this.token.type !== CsspDictionary.Syntax.RPAR)
      throw new Error("Expected )");
    this.next();
    return res;
  }

  _stylePropExpression(p) {
    let res = p;
    if (
      this.token.type !== CsspDictionary.Syntax.LPAR &&
      this.token.type !== CsspDictionary.Syntax.SELECTOR_L
    )
      throw new Error("Expected ( or {");
    this.next();
    while (
      this.token !== null &&
      this.token.type !== CsspDictionary.Syntax.RPAR &&
      this.token.type !== CsspDictionary.Syntax.SELECTOR_R
    ) {
      switch (true) {
        case this.token.type === CsspDictionary.Types.PROP_NAME:
          res.push(this.propStyleNode());
          this.next();
          break;
        case this.token.type === CsspDictionary.Types.TEMP_CALL:
          res.push(new CsspTemplateCallNode(this.token.value));
          this.next();
          break;
        case this.token.type === CsspDictionary.Types.SELECTOR:
          res.push(this.styleNode(true));
          break;
        default:
          throw new Error(JSON.stringify(this.token));
      }
    }
    return res;
  }

  styleNode(isSelector) {
    let res;

    let type = "name";
    let name = this.token.value;

    if (isSelector) {
      switch (true) {
        case this.token.value.startsWith("."):
          type = "class";
          name = name.substring(1);
          break;
        case this.token.value.startsWith("#"):
          type = "id";
          name = name.substring(1);
          break;
      }
      res = new CsspSelectorNode(name, [], type);
    } else {
      res = new CsspTemplateNode(this.token.value, []);
    }

    this.next();
    if (this.token.type !== CsspDictionary.Syntax.SELECTOR_L)
      throw new Error(`Expected { at line ${this.token.ln}:${this.token.col}`);
    res.children = this._stylePropExpression(res.children);
    if (this.token.type !== CsspDictionary.Syntax.SELECTOR_R)
      throw new Error("Expected }");
    this.next();
    return res;
  }

  propStyleNode() {
    let res = new CsspPropStyleNode(this.token.value, null);
    this.next();
    if (this.token.type !== CsspDictionary.Syntax.VAL_EQ)
      throw new Error("Expected :");
    this.next();
    if (this.token.type === CsspDictionary.Types.VAR_NAME) {
      res.call = true;
    }
    res.value = this.token.value;
    return res;
  }

  variableDeclarationNode() {
    let res = new CsspVariableNode(this.token.value, null);
    const allowedTypesAfter = [
      CsspDictionary.Types.PROP_VAL,
      CsspDictionary.Types.VAR_NAME,
    ];
    this.next();

    switch (true) {
      case this.token.type === CsspDictionary.Syntax.VAL_EQ:
        this.next();
        if (allowedTypesAfter.includes(this.token.type)) {
          res.value = this.token.value;
          if (this.token.type === CsspDictionary.Types.VAR_NAME) {
            res.isRef = true;
          }
          this.next();
        } else {
          throw new Error(`Syntax error: expected , found ,`);
        }
        break;
    }

    return res;
  }
}

module.exports = CsspParser;
