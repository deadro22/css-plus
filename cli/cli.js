#!/usr/bin/env node

const fs = require("fs");
const dir = process.cwd();
const Compiler = require("cssp-compiler");
const chalk = require("chalk");

const logError = (err) => {
  console.log(chalk.red.bold(err));
  process.exit(0);
};

const command = [process.argv[2], process.argv[3]];
let filename = "style.cssp";

if (command[0]) {
  filename = command[0];
}

if (command[0] && command[0].split(".").pop() !== "cssp") {
  logError("Only cssp extension is supported");
}

fs.readFile(dir + `/${filename}`, (err, data) => {
  if (err) {
    const errMsg =
      err.code === "ENOENT" ? `Source file ${filename} not found` : err.message;
    logError(errMsg);
  }

  const dt = data.toString();
  const output = Compiler.compile(dt);
  let outputFileName = "style.css";

  if (command[1]) outputFileName = command[1];

  fs.writeFile(dir + `/${outputFileName}`, output, (err) => {
    if (err) throw err;
    console.log(
      chalk.greenBright.bold(
        filename,
        "compiled successfully into",
        outputFileName
      )
    );
  });
});
