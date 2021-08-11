class CsspVariableNode {
  constructor(name, value, isRef = false) {
    this.name = name;
    this.value = value;
    this.isRef = isRef;
  }
}

class CsspMain {
  constructor(type, children) {
    this.type = type;
    this.children = children;
  }
}

class CsspTemplateNode {
  constructor(name, children) {
    this.name = name;
    this.children = children;
  }
}

class CsspPropStyleNode {
  constructor(name, value, call = false) {
    this.name = name;
    this.value = value;
    this.call = call;
  }
}

class CsspTemplateCallNode {
  constructor(ref) {
    this.ref = ref;
  }
}

class CsspSelectorNode {
  constructor(name, children, type) {
    this.name = name;
    this.children = children;
    this.type = ["class", "id", "name"].includes(type) ? type : "name";
  }
}

module.exports = {
  CsspVariableNode,
  CsspMain,
  CsspTemplateNode,
  CsspTemplateCallNode,
  CsspPropStyleNode,
  CsspSelectorNode,
};
