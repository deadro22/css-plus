const CsspDictionary = {
  Elems: {
    O_ELEM: "HTML_OPENING_ELEM",
    C_ELEM: "HTML_CLOSING_ELEM",
  },
  Syntax: {
    VAR_IDENT: "_",
    VAL_EQ: ":",
    STATEMENT_END: ";",
    RPAR: ")",
    LPAR: "(",
    TEMP_CALL: "&",
    SELECTOR_L: "{",
    SELECTOR_R: "}",
    CLASS_SELECTOR: ".",
    ID_SELECTOR: "#",
  },
  Types: {
    VAR_NAME: "VAR_NAME",
    PROP_NAME: "PROP_NAME",
    PROP_VAL: "PROP_VAL",
    TEMP_DEF: "TEMP_DEF",
    TEMP_CALL: "TEMP_CALL",
    SELECTOR: "SELECTOR",
    CLASS_SELECTOR: "CLASS_SELECTOR",
    ID_SELECTOR: "ID_SELECTOR",
  },
};

class CsspToken {
  constructor(type, value = null, ln, col) {
    this.type = type;
    this.value = value;
    this.ln = ln;
    this.col = col;
  }
}

module.exports.CsspToken = CsspToken;
module.exports.CsspDictionary = CsspDictionary;
