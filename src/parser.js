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

    return { AST: this.AST, error: null };
  }

  _fromExpression(p) {
    while (this.token !== null) {
      switch (true) {
        case this.token.type === CsspDictionary.Types.TEMP_DEF:
          p.push(this._makeTemplateDefNode());
          this.next();
          break;
        case this.token.type === CsspDictionary.Types.SELECTOR:
          p.push(this._makeSelectorNode());
          this.next();
          break;
        case this.token.type === CsspDictionary.Types.PROP_NAME:
          p.push(this._makeStyleNode());
          //this.next();
          break;
        case this.token.type === CsspDictionary.Types.VAR_NAME:
          p.push(this._makeVariableDeclarationNode());
          //this.next();
          break;
        default:
          this.returnError(
            "Unexpected token " + this.token.value || this.token.type
          );
      }
    }

    return p;
  }

  _makeVariableDeclarationNode() {
    let res = new CsspVariableNode(this.token.value, null);
    const allowedTypesAfter = [
      CsspDictionary.Types.PROP_VAL,
      CsspDictionary.Types.VAR_NAME,
      CsspDictionary.Types.FUNC,
    ];
    this.next();

    switch (true) {
      case this.token.type === CsspDictionary.Syntax.VAL_EQ:
        this.next();
        if (allowedTypesAfter.includes(this.token.type)) {
          res.value = this.token.value;
          if (this.token.type === CsspDictionary.Types.VAR_NAME) {
            res.isRef = true;
            this.next();
          } else if (this.token.type === CsspDictionary.Types.FUNC) {
            res.value = this.createFuncCall();
            res.isRef = false;
          } else {
            this.next();
          }
        } else {
          throw new Error(`Syntax error: expected , found ,`);
        }
        break;
    }

    return res;
  }

  _makeSelectorNode() {
    let sl = new CsspSelectorNode(this.token.value, [], "name");
    this.next();

    if (this.token.type !== CsspDictionary.Syntax.SELECTOR_L)
      this.returnError("Expected {");
    this.next();

    if (
      this.token.type !== CsspDictionary.Types.PROP_NAME &&
      this.token.type !== CsspDictionary.Types.TEMP_CALL &&
      this.token.type !== CsspDictionary.Types.SELECTOR &&
      this.token.type !== CsspDictionary.Syntax.SELECTOR_R
    )
      this.returnError(
        `Expected property, template call or a selector, found ${this.token.type}`
      );

    this._stylePropExpression(sl.children);

    return sl;
  }

  _stylePropExpression(p) {
    let res = p;

    while (
      this.token !== null &&
      this.token.type !== CsspDictionary.Syntax.RPAR &&
      this.token.type !== CsspDictionary.Syntax.SELECTOR_R
    ) {
      switch (true) {
        case this.token.type === CsspDictionary.Types.PROP_NAME:
          res.push(this._makeStyleNode());
          //this.next();
          break;
        case this.token.type === CsspDictionary.Types.TEMP_CALL:
          res.push(new CsspTemplateCallNode(this.token.value));
          this.next();
          break;
        case this.token.type === CsspDictionary.Types.SELECTOR:
          res.push(this._makeSelectorNode());
          this.next();
          break;
        case this.token.type === CsspDictionary.Types.VAR_NAME:
          res.push(this._makeVariableDeclarationNode());
          break;
        default:
          throw new Error(JSON.stringify(this.token));
      }
    }
    return res;
  }

  _makeTemplateDefNode() {
    let res = new CsspTemplateNode(this.token.value, []);
    this.next();

    if (!this.token.type === CsspDictionary.Syntax.LPAR)
      this.returnError("Missing (");

    this.next();

    while (
      this.token !== null &&
      this.token.type !== CsspDictionary.Syntax.RPAR
    ) {
      res.children.push(this._makeStyleNode());
    }

    return res;
  }

  _makeStyleNode() {
    if (
      this.token.type !== CsspDictionary.Types.PROP_NAME &&
      this.token.type !== CsspDictionary.Types.VAR_NAME
    )
      this.returnError("Expected property found " + this.token.type);

    let res = new CsspPropStyleNode(this.token.value, null);

    this.next();
    if (this.token.type !== CsspDictionary.Syntax.VAL_EQ)
      this.returnError(`Missing ":" for property ${res.name}`);

    this.next();
    if (
      this.token.type !== CsspDictionary.Types.PROP_VAL &&
      this.token.type !== CsspDictionary.Types.VAR_NAME &&
      this.token.type !== CsspDictionary.Types.FUNC
    ) {
      this.returnError(`Invalid property value ${this.token.type}`);
    }

    let val = "";
    if (this.token.type === CsspDictionary.Types.PROP_VAL) {
      while (
        this.token !== null &&
        this.token.type === CsspDictionary.Types.PROP_VAL
      ) {
        val += this.token.value + " ";
        this.next();
      }
    } else if (this.token.type === CsspDictionary.Types.FUNC) {
      val = this.createFuncCall();
    } else {
      val = this.token.value;
      res.call = true;
    }
    res.value = val.trim();
    return res;
  }

  createFuncCall = () => {
    let v = this.token.value;

    this.next();

    if (this.token.type !== CsspDictionary.Syntax.LPAR)
      this.returnError(`Missing "(" for css function ${v}`);
    v += "(";
    this.next();

    while (
      this.token !== null &&
      this.token.type !== CsspDictionary.Syntax.RPAR
    ) {
      if (this.token.type !== CsspDictionary.Types.ARG)
        this.returnError("Expected argument for css function " + v);
      v += this.token.value;

      this.next();

      if (
        this.token.type !== CsspDictionary.Syntax.ARG_SEPARATOR &&
        this.token.type !== CsspDictionary.Syntax.RPAR
      )
        this.returnError("Expected , or ) for css function " + v);

      if (this.token.type === CsspDictionary.Syntax.RPAR) {
        this.next();
        break;
      }
      v += ",";
      this.next();
    }

    v += ")";
    return v;
  };

  returnError(err) {
    throw new Error(`${err}\nLine ${this.token.ln}:${this.token.col}`);
  }
}

module.exports = CsspParser;
