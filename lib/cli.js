import { Command, Option } from "commander";
import { createReadStream, createWriteStream } from "fs";
import { defaultCSS, tracks } from "./index.js";
import { format, join, parse } from "path";
import { readFile, stat } from "fs/promises";

function readStream(stream) {
  return new Promise((resolve, reject) => {
    let res = "";
    stream.on("data", data => (res += data));
    stream.on("error", reject);
    stream.on("end", () => resolve(res));
  });
}

function switchExt(initial, newExt, dir) {
  const parsed = parse(initial);
  parsed.ext = newExt;
  delete parsed.base;
  if (dir) {
    delete parsed.dir;
  }
  return format(parsed);
}

/**
 * The command line interface for peggy-tracks, abstracted to make it testable
 * without having to fork/exec a bunch of small child processes.
 * Call .exitOverride() if you would like an exception thrown from main() rather
 * than having the process exit.
 */
export default class CliCommand extends Command {
  constructor() {
    super();

    /**
     * Where to get input if an input file isn't specified.
     *
     * @type {NodeJS.ReadStream}
     */
    this.defaultInputStream = process.stdin;

    /**
     * Where to send output if an output file isn't specified.  Also used for
     * Commander help output.
     *
     * @type {NodeJS.WriteStream}
     */
    this.defaultOutputStream = process.stdout;

    /**
     * Where to send error text, including that from Commander.
     *
     * @type {NodeJS.WriteStream}
     */
    this.errorStream = process.stderr;

    this
      .configureOutput({
        writeOut: c => this.defaultOutputStream.write(c),
        writeErr: c => this.errorStream.write(c),
      })
      .argument("[input_file]")
      .option("-a,--action", "Wrap actions in a box")
      .option("-c,--css [file name]", "With no file name, outputs the default CSS.  With a filename, substitutes the CSS in that file")
      .addOption(new Option("-d,--depth <number>", "Maximum depth to expand references").conflicts("expand"))
      .option("-e,--expand", "Expand rule references without depth limit")
      .option("-o,--output <file name>", "File in which to save output")
      .option("-q,--quote <string>", "Quote character for literals", '"')
      .option("-s,--start <rule name>", "Rule to start with");
  }

  /**
   * Run the main program with the arguments provided.  Only guaranteed to
   * work the first time.
   *
   * @param {string[]} [argv] - If not specified, uses process.argv.  Assumed
   *   to be in "node" format, with the node binary name as argv[0] and the
   *   name of the running script as argv[1].
   * @return {Promise<void>}
   */
  async main(argv) {
    this.parse(argv);
    const opts = this.opts();

    let css = undefined;
    if (opts.css === true) {
      this.defaultOutputStream.write(defaultCSS);
      this.defaultOutputStream.end("\n");

      // @ts-ignore: Property '_exit' does not exist on type 'CliCommand'
      this._exit(0, "peggy-tracks.css");
    } else if (opts.css) {
      css = await readFile(opts.css, "utf8");
      delete opts.css;
    }

    let depth = 0;
    if (opts.expand === true) {
      depth = Infinity;
    } else if (typeof opts.depth === "string") {
      depth = parseInt(opts.depth, 10);
      if (isNaN(depth) || depth < 0) {
        this.error(`"--depth" must be positive integer, got "${opts.depth}"`);
      }
    }
    opts.depth = depth;

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
              ? join(opts.output, switchExt(grammarSource, ".svg", true))
              : opts.output;
          } catch (e) {
            output = opts.output;
          }
          delete opts.output;
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
          // Note that new ComplexDiagram() returns a Diagram.  I don't know
          // why it's not just a subclass, but don't want to make that drastic
          // a change to the original code.
          // @ts-ignore TS2339
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
