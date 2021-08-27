#! /usr/bin/env node

import { Command } from "commander/esm.mjs";
import fs from "fs";
import path from "path";
import { tracks } from "../index.js";

const program = new Command();

const opts = program
  .argument("[input_file]")
  .option("-s,--start <rule name>", "Rule to start with")
  .option("-e,--expand", "Expand rule references")
  .option("-o,--output <file name>", "File in which to save ouptut")
  .parse()
  .opts();

const files = program.args.length ? program.args : ["-"];

function readFile(name) {
  return new Promise((resolve, reject) => {
    const stream = (name === "-") ? process.stdin : fs.createReadStream(name);
    const bufs = [];
    stream.on("data", data => bufs.push(data));
    stream.on("error", reject);
    stream.on("end", () => {
      resolve(Buffer.concat(bufs).toString("utf8"));
    });
  });
}

function switchExt(initial, newExt) {
  const parsed = path.parse(initial);
  parsed.ext = newExt;
  delete parsed.base;
  return path.format(parsed);
}

async function main() {
  for (const grammarSource of files) {
    const text = await readFile(grammarSource);
    try {
      const diag = tracks({
        ...opts,
        text,
        parserOptions: {
          grammarSource,
        },
      });
      const output = opts.output || (grammarSource === "-" ? "-" : switchExt(grammarSource, ".svg"));
      const os = output === "-" ? process.stdout : fs.createWriteStream(output);
      os.write(diag.toStandalone());
    } catch (er) {
      if (typeof er.format === "function") {
        console.error(er.format([{
          source: grammarSource,
          text,
        }]));
      } else {
        console.error(er);
      }
    }
  }
}

main().catch(console.error);
