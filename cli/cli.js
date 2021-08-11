#!/usr/bin/env node

const fs = require("fs");
const dir = process.cwd();
const Compiler = require("cssp-compiler");
const chalk = require("chalk");

const logError = (err) => {
  console.log(chalk.red.bold(err));
  process.exit(0);
};

const outputToFile = (output, outputFileName, filename, log) => {
  fs.writeFile(dir + `/${outputFileName}`, output, (err) => {
    if (err) throw err;
    log &&
      console.log(
        chalk.greenBright.bold(
          filename,
          "compiled successfully into",
          outputFileName
        )
      );
  });
};

const command = [process.argv[2], process.argv[3], process.argv[4]];

let filename = "style.cssp";

if (command[0] && !command[0].startsWith("-")) {
  filename = command[0];
}

if (
  command[0] &&
  !command[0].startsWith("-") &&
  command[0].split(".").pop() !== "cssp"
) {
  logError("Only cssp extension is supported");
}

fs.readFile(dir + `/${filename}`, (err, data) => {
  if (err) {
    const errMsg =
      err.code === "ENOENT" ? `Source file ${filename} not found` : err.message;
    logError(errMsg);
  }

  const dt = data.toString();
  let outputFileName = "style.css";

  if (command.includes("-w")) {
    console.log(
      chalk.greenBright.bold(
        `Watching file ${filename}\nOutput: ${outputFileName}`
      )
    );
    fs.watchFile(
      dir + `/${filename}`,
      { persistent: true, interval: 500 },
      (curr, prev) => {
        const ct = fs.readFileSync(dir + `/${filename}`, "utf8");
        const output = Compiler.compile(ct);
        outputToFile(output, outputFileName, filename);
      }
    );
  } else {
    const output = Compiler.compile(dt);

    if (command[1]) outputFileName = command[1];

    outputToFile(output, outputFileName, filename, true);
  }
});
