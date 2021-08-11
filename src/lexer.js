"use strict";
const { CsspToken, CsspDictionary } = require("./tokens.js");

const WHITESPACE = [" ", "\n", "\t", "\r"];
const CHARACTERS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

class CsspLexer {
  constructor(source) {
    this.TOKENS = [];
    this.character = null;
    this.col = -1;
    this.characterIndex = 0;
    this.line = 1;
    this.source = source;
    this.next();
  }

  static readSource(source) {
    return new CsspLexer(source).generateTokens();
  }

  next() {
    this.character = this.source[this.characterIndex];
    this.characterIndex += 1;

    this.col += 1;

    if (!this.character) {
      this.character = null;
    }
  }

  addToken(type, value, ln, col) {
    this.TOKENS.push(
      new CsspToken(
        type,
        value && value.trim(),
        ln || this.line,
        col || this.col
      )
    );
  }

  generateTokens() {
    while (this.character !== null) {
      switch (true) {
        case WHITESPACE.includes(this.character):
          if (this.character === "\n") {
            this.line += 1;
            this.col = 0;
          }
          this.next();
          break;

        case this.character === CsspDictionary.Syntax.VAR_IDENT:
          this.next();
          this.varDecToken();
          break;

        case this.character === CsspDictionary.Syntax.TEMP_CALL:
          this.styleTempCallToken();
          break;

        case this.character === CsspDictionary.Syntax.VAL_EQ:
          this.addToken(":", null);
          this.next();

          break;

        case this.character === CsspDictionary.Syntax.LPAR:
          this.addToken(CsspDictionary.Syntax.LPAR, null);
          this.next();
          break;

        case this.character === CsspDictionary.Syntax.RPAR:
          this.addToken(CsspDictionary.Syntax.RPAR, null);
          this.next();
          break;

        case CHARACTERS.includes(this.character.toUpperCase()) ||
          this.character === CsspDictionary.Syntax.CLASS_SELECTOR ||
          this.character === CsspDictionary.Syntax.ID_SELECTOR:
          this.propTypeToken();
          break;

        case this.character === CsspDictionary.Syntax.SELECTOR_L:
          this.addToken(CsspDictionary.Syntax.SELECTOR_L, null);
          this.next();
          break;

        case this.character === CsspDictionary.Syntax.SELECTOR_R:
          this.addToken(CsspDictionary.Syntax.SELECTOR_R, null);
          this.next();
          break;

        default:
          throw new Error(
            `Illegal character ${JSON.stringify(this.character)} at line ${
              this.line
            }:${this.col}`
          );
      }
    }
    return this.TOKENS;
  }

  propTypeToken() {
    let ln = this.line;
    let col = this.col;
    let prop = this.character;
    this.next();

    while (
      this.character !== null &&
      ![
        CsspDictionary.Syntax.VAL_EQ,
        CsspDictionary.Syntax.LPAR,
        CsspDictionary.Syntax.SELECTOR_L,
        CsspDictionary.Syntax.STATEMENT_END,
      ].includes(this.character)
    ) {
      prop += this.character;
      this.next();
    }

    let type;

    switch (true) {
      case this.character === CsspDictionary.Syntax.VAL_EQ:
        type = CsspDictionary.Types.PROP_NAME;
        break;
      case this.character === CsspDictionary.Syntax.LPAR:
        type = CsspDictionary.Types.TEMP_DEF;
        break;
      case this.character === CsspDictionary.Syntax.SELECTOR_L:
        type = CsspDictionary.Types.SELECTOR;
        break;
      case this.character === CsspDictionary.Syntax.STATEMENT_END:
        type = CsspDictionary.Types.PROP_VAL;
        this.next();
        break;
    }

    this.addToken(type, prop, ln, col);
  }

  varDecToken() {
    let ln = this.line;
    let col = this.col;
    let varDec = this.character;
    this.next();

    while (
      this.character !== null &&
      this.character !== CsspDictionary.Syntax.VAL_EQ &&
      this.character !== CsspDictionary.Syntax.STATEMENT_END &&
      this.character !== CsspDictionary.Syntax.RPAR
    ) {
      varDec += this.character;
      this.next();
    }

    if (this.character === CsspDictionary.Syntax.STATEMENT_END) this.next();

    this.addToken(CsspDictionary.Types.VAR_NAME, varDec, ln, col);
  }

  styleTempCallToken() {
    let ln = this.line;
    let col = this.col;
    this.next();
    let styleTempName = "";

    while (
      this.character !== null &&
      this.character !== CsspDictionary.Syntax.STATEMENT_END &&
      this.character !== CsspDictionary.Syntax.SELECTOR_R &&
      this.character !== CsspDictionary.Syntax.RPAR
    ) {
      if (!WHITESPACE.includes(this.character)) {
        styleTempName += this.character;
      }
      this.next();
    }
    if (this.character === CsspDictionary.Syntax.STATEMENT_END) this.next();

    this.addToken(CsspDictionary.Types.TEMP_CALL, styleTempName, ln, col);
  }
}

module.exports = CsspLexer;
