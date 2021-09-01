import { createReadStream, createWriteStream } from "fs";
import { readFile, stat } from "fs/promises";
import { Command } from "commander/esm.mjs";
import { defaultCSS } from "../vendor/railroad-diagrams/railroad.js";
import path from "path";
import { tracks } from "./index.js";

function readStream(stream) {
  return new Promise((resolve, reject) => {
    let res = "";
    stream.on("data", data => (res += data));
    stream.on("error", reject);
    stream.on("end", () => resolve(res));
  });
}

function switchExt(initial, newExt, dir) {
  const parsed = path.parse(initial);
  parsed.ext = newExt;
  delete parsed.base;
  if (dir) {
    delete parsed.dir;
  }
  return path.format(parsed);
}

export default class CliCommand extends Command {
  constructor() {
    super();
    this.defaultInputStream = process.stdin;
    this.defaultOutputStream = process.stdout;
    this.errorStream = process.stderr;

    this
      .argument("[input_file]")
      .option("-a,--action", "Wrap actions in a box")
      .option("-c,--css [file name]", "With no file name, outputs the default CSS.  With a filename, substitutes the CSS in that file.")
      .option("-e,--expand", "Expand rule references")
      .option("-o,--output <file name>", "File in which to save output")
      .option("-s,--start <rule name>", "Rule to start with");
  }

  async main(argv) {
    this.parse(argv);
    const opts = this.opts();

    let css = undefined;
    if (opts.css === true) {
      this.defaultOutputStream.write(defaultCSS);
      this.defaultOutputStream.end("\n");
      this._exit(0, "peggy-tracks.css");
    } else if (opts.css) {
      css = await readFile(opts.css, "utf8");
      delete opts.css;
    }

    const files = this.args.length ? this.args : ["-"];
    for (const grammarSource of files) {
      const stream = (grammarSource === "-")
        ? this.defaultInputStream
        : createReadStream(grammarSource);

      const text = await readStream(stream);
      try {
        const diag = tracks({
          ...opts,
          text,
          parserOptions: {
            grammarSource,
          },
        });

        let output = null;
        if (opts.output) {
          try {
            const stats = await stat(opts.output);
            output = stats.isDirectory()
              ? path.join(opts.output, switchExt(grammarSource, ".svg", true))
              : opts.output;
          } catch (e) {
            output = opts.output;
          }
        } else {
          output = (grammarSource === "-")
            ? "-"
            : switchExt(grammarSource, ".svg", false);
        }
        let ostream = null;
        if (output === "-") {
          ostream = this.defaultOutputStream;
        } else {
          ostream = createWriteStream(output);
          // Catch file creation errors before trying to write.
          await new Promise((resolve, reject) => {
            ostream.once("open", resolve);
            ostream.once("error", reject);
          });
        }

        // Catch write errors separately, since stdout won't have had its
        // error event hooked above.
        await new Promise((resolve, reject) => {
          ostream.on("finish", resolve);
          ostream.on("error", reject);
          ostream.end(diag.toStandalone(css));
        });
      } catch (er) {
        if (typeof er.format === "function") {
          this.errorStream.write(er.format([{
            source: grammarSource,
            text,
          }]));
          this.errorStream.write("\n");
        } else {
          throw er;
        }
      }
    }
  }
}
