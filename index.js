const Compiler = require("cssp-compiler");

module.exports = function (source) {
  const output = Compiler.compile(source);
  return `
     const st = document.createElement("style");
     st.appendChild(document.createTextNode(\`${output}\`));
     document.head.appendChild(st);`;
};
