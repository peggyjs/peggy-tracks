import { Readable, Transform } from "stream";
import CLI from "../lib/cli.js";
import { rm } from "fs/promises";
import test from "ava";
import url from "url";

const P = [process.argv0, "peggy-tracks"];

class Buf extends Transform {
  constructor(opts = {}) {
    const { errorToThrow, ...others } = opts;
    super({
      ...others,
      encoding: "utf8",
    });
    this.errorToThrow = errorToThrow;
  }

  _transform(chunk, encoding, cb) {
    if (this.errorToThrow) {
      cb(this.errorToThrow);
    } else {
      this.push(chunk);
      cb();
    }
  }
}

async function exec(t, argv, code, opts) {
  const cli = new CLI();
  Object.assign(cli, opts);
  cli.exitOverride();
  const res = {
    out: "",
    err: "",
  };
  cli.configureOutput({
    writeOut: c => (res.out += c),
    writeErr: c => (res.err += c),
  });

  if (code) {
    await t.throwsAsync(() => cli.main([...P, ...argv])); // , { code });
  } else {
    await cli.main([...P, ...argv]);
  }
  return res;
}

test("cli help", async t => {
  const { out } = await exec(t, ["-h"], "commander.helpDisplayed");

  t.is(out, `\
Usage: peggy-tracks [options] [input_file]

Options:
  -a,--action              Wrap actions in a box
  -s,--start <rule name>   Rule to start with
  -e,--expand              Expand rule references
  -o,--output <file name>  File in which to save output
  -h, --help               display help for command
`);

  const { err } = await exec(t, ["-s"], "commander.optionMissingArgument");
  t.is(err, "error: option '-s,--start <rule name>' argument missing\n");
});

test("default output", async t => {
  const defaultOutputStream = new Buf();
  const res = await exec(t, [], null, {
    defaultInputStream: Readable.from("foo = '1'", { objectMode: false }),
    defaultOutputStream,
  });
  t.deepEqual(res, { err: "", out: "" });
  t.regex(defaultOutputStream.read(), /^<svg/);
});

test("file output", async t => {
  const inp = url.fileURLToPath(new URL("test.peggy", import.meta.url));
  const res = await exec(t, ["-s", "comment", inp]);
  t.deepEqual(res, {
    out: "",
    err: "",
  });
  await rm(url.fileURLToPath(new URL("test.svg", import.meta.url)));

  const outd = url.fileURLToPath(new URL("output", import.meta.url));
  await exec(t, ["-o", outd, "-s", "comment", "-e", inp]);
  const outf = url.fileURLToPath(new URL("output/comment.svg", import.meta.url));
  await exec(t, ["-o", outf, "-s", "comment", inp]);
});

test("grammar error", async t => {
  const errorStream = new Buf();
  const res = await exec(t, [], null, {
    defaultInputStream: Readable.from("foo ==", { objectMode: false }),
    errorStream,
  });
  t.deepEqual(res, { err: "", out: "" });
  t.is(errorStream.read(), `\
Error: Expected "!", "$", "&", "(", ".", "@", character class, comment, end of line, identifier, literal, or whitespace but "=" found.
 --> -:1:6
  |
1 | foo ==
  |      ^
`);
});

test("non-grammar error", async t => {
  await exec(t, ["FILE_DOES_NOT_EXIST"], "ENOENT");
  await exec(t, ["-o", "DIRECTORY_DOES_NOT_EXIST/foo.svg"], "ENOENT", {
    defaultInputStream: Readable.from("foo = '1'", { objectMode: false }),
  });

  const errorToThrow = new Error("Forced write error");
  errorToThrow.code = "FORCED";
  const defaultOutputStream = new Buf({ errorToThrow });
  await exec(t, [], "FORCED", {
    defaultInputStream: Readable.from("foo = '1'", { objectMode: false }),
    defaultOutputStream,
  });
});
