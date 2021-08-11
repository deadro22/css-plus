const fs = require("fs");
const compiler = require("../compiler/compiler");
const source = fs.readFileSync(__dirname + "/style.cssp").toString();

const output = compiler(source);
fs.writeFileSync(__dirname + "/style.css", output);
