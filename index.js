const fs = require("fs");
const Compiler = require("cssp-compiler");

const source = fs.readFileSync(__dirname + "/src/style.cssp").toString();
const output = Compiler.compile(source);

fs.writeFileSync(__dirname + "/src/style.css", output);
