const {
  CsspSelectorNode,
  CsspTemplateCallNode,
  CsspPropStyleNode,
  CsspVariableNode,
  CsspTemplateNode,
  CsspMain,
} = require("./nodes");

class CsspInterpreter {
  constructor() {
    this.output = ``;
    this.blocks = [];
    this.scope = Object.create(null);
    this.stack = [];
    this.templates = Object.create(null);
  }

  static run($main) {
    return new CsspInterpreter().visit($main);
  }

  visitStyleProps = ($node) => {
    if ($node.constructor.name === CsspPropStyleNode.name) {
      let styleValue;
      if ($node.call) {
        if (!this.scope[$node.value])
          throw new Error(`Undefined variable _${$node.value}`);
        styleValue = this.scope[$node.value];
      } else {
        styleValue = $node.value;
      }
      return `${$node.name}:${styleValue};\n`;
    } else if ($node.constructor.name === CsspTemplateCallNode.name) {
      if (!this.templates[$node.ref])
        throw new Error(`Undefined template ${$node.ref}`);

      return this.templates[$node.ref];
    } else {
      return "";
    }
  };

  makeStylePropsBlock = ($node) => {
    let so = "";
    $node.children &&
      $node.children.forEach(($chs) => {
        so += this.visitStyleProps($chs);
      });

    return so;
  };

  visit = ($node) => {
    switch (true) {
      case $node.constructor.name === CsspMain.name:
        this.blocks.push("/* Generated Cssp */");
        $node.children && $node.children.map(this.visit);
        break;

      case $node.constructor.name === CsspSelectorNode.name:
        let styleOutput = this.makeStylePropsBlock($node);

        let selectorPrefix = $node.name;
        switch ($node.type) {
          case "name":
            selectorPrefix = "" + selectorPrefix;
            break;
          case "id":
            selectorPrefix = "#" + selectorPrefix;
            break;
          case "class":
            selectorPrefix = "." + selectorPrefix;
            break;
        }

        const nm = `${this.stack.join(" ")} ${selectorPrefix}`;

        const selector =
          this.stack.length > 0
            ? `${nm} {\n${styleOutput}}`
            : selectorPrefix + ` {\n${styleOutput}}`;

        this.blocks.push(selector);
        this.stack.push(selectorPrefix);

        $node.children && $node.children.map(this.visit);
        this.stack.pop();
        break;

      case $node.constructor.name === CsspVariableNode.name:
        this.scope[$node.name] = $node.value;
        break;

      case $node.constructor.name === CsspTemplateNode.name:
        this.templates[$node.name] = `${this.makeStylePropsBlock($node)}`;
        break;
    }
    return this.blocks.join("\n");
  };
}

module.exports = CsspInterpreter;
