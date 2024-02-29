import { readFile, rm, stat } from "fs/promises";
import CLI from "../lib/cli.js";
import { Transform } from "stream";
import path from "path";
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

  static from(str) {
    return new Buf().end(str);
  }
}

async function exec(t, argv, code, opts) {
  const cli = new CLI();
  Object.assign(cli, opts);
  cli.exitOverride();

  if (code) {
    return t.throwsAsync(() => cli.main([...P, ...argv]), { code });
  }
  const res = await cli.main([...P, ...argv]);
  t.pass(`Executed "${argv.join(" ")}"`);
  return res;
}

test("cli help", async t => {
  const defaultOutputStream = new Buf();
  await exec(t, ["-h"], "commander.helpDisplayed", {
    defaultOutputStream,
  });

  t.snapshot(defaultOutputStream.read());

  const errorStream = new Buf();
  await exec(t, ["-s"], "commander.optionMissingArgument", {
    errorStream,
  });
  t.is(errorStream.read(), "error: option '-s,--start <rule name>' argument missing\n");
});

test("default output", async t => {
  const defaultOutputStream = new Buf();
  await exec(t, [], null, {
    defaultInputStream: Buf.from("foo = '1'"),
    defaultOutputStream,
  });
  t.regex(defaultOutputStream.read(), /^<svg/);
});

test("file output", async t => {
  let outfile = url.fileURLToPath(new URL("test.svg", import.meta.url));
  // Didn't exist when we started
  await t.throwsAsync(() => stat(outfile));
  let inp = url.fileURLToPath(new URL("test.peggy", import.meta.url));
  await exec(t, ["-s", "Comment", inp]);
  let outtext = await readFile(outfile, "utf8");
  t.regex(outtext, /^<svg/);
  await rm(outfile);
  t.snapshot(outtext);

  const outd = url.fileURLToPath(new URL("output", import.meta.url));
  outfile = path.join(outd, "comment.svg");
  await exec(t, ["-o", outd, "-s", "Comment", "-e", inp]);
  outtext = await readFile(outfile, "utf8");
  t.snapshot(outtext);
  await exec(t, ["-o", outfile, "-s", "Comment", inp]);
  const outtext2 = await readFile(outfile, "utf8");
  t.is(outtext, outtext2);

  inp = url.fileURLToPath(new URL("repeat.peggy", import.meta.url));
  outfile = path.join(outd, "repeat.svg");
  await exec(t, ["-o", outd, inp]);
  outtext = await readFile(outfile, "utf8");
  t.snapshot(outtext);

  inp = url.fileURLToPath(new URL("numbers.peggy", import.meta.url));
  outfile = path.join(outd, "numbers.svg");
  await exec(t, ["-o", outd, inp]);
  outtext = await readFile(outfile, "utf8");
  t.snapshot(outtext);

  inp = url.fileURLToPath(new URL("numbers2.peggy", import.meta.url));
  outfile = path.join(outd, "numbers2.svg");
  await exec(t, ["-o", outd, inp]);
  outtext = await readFile(outfile, "utf8");
  t.snapshot(outtext);
});

test("grammar error", async t => {
  const errorStream = new Buf();
  await exec(t, [], null, {
    defaultInputStream: Buf.from("foo =="),
    errorStream,
  });
  t.is(errorStream.read(), `\
Error: Expected "(", ".", "@", [!$&], [!&], character class, comment, end of line, identifier, literal, or whitespace but "=" found.
 --> -:1:6
  |
1 | foo ==
  |      ^
`);
});

test("non-grammar error", async t => {
  await exec(t, ["FILE_DOES_NOT_EXIST"], "ENOENT");
  await exec(t, ["-o", "DIRECTORY_DOES_NOT_EXIST/foo.svg"], "ENOENT", {
    defaultInputStream: Buf.from("foo = '1'"),
  });

  const errorToThrow = new Error("Forced write error");
  errorToThrow.code = "FORCED";
  const defaultOutputStream = new Buf({ errorToThrow });
  await exec(t, [], "FORCED", {
    defaultInputStream: Buf.from("foo = '1'"),
    defaultOutputStream,
  });
});

test("output css", async t => {
  const defaultOutputStream = new Buf();
  await exec(t, ["-c"], "peggy-tracks.css", { defaultOutputStream });
  const css = defaultOutputStream.read();
  t.regex(css, /text\.diagram-arrow/);
});

test("input css", async t => {
  const defaultOutputStream = new Buf();
  const css = url.fileURLToPath(new URL("pretty.css", import.meta.url));
  await exec(t, ["-c", css], null, {
    defaultInputStream: Buf.from("foo = '1'"),
    defaultOutputStream,
  });
  const out = defaultOutputStream.read();
  t.regex(out, /hotpink/);
});

test("more examples", async t => {
  const inp = url.fileURLToPath(new URL("test.peggy", import.meta.url));
  const actionURL = new URL("output/action.svg", import.meta.url);
  const action = url.fileURLToPath(actionURL);
  const css = url.fileURLToPath(new URL("pretty.css", import.meta.url));
  await exec(t, ["--action", "--output", action, "--css", css, "-s", "Number", inp]);
  t.snapshot(await readFile(actionURL, "utf8"));

  const fullURL = url.fileURLToPath(new URL("output/full.svg", import.meta.url));
  await exec(t, ["-e", "-o", fullURL, inp]);
  t.snapshot(await readFile(fullURL, "utf8"));
});

test("depth", async t => {
  const inp = url.fileURLToPath(new URL("test.peggy", import.meta.url));

  let q = "";
  for (let i = 0; i < 5; i++) {
    const fullURL = url.fileURLToPath(new URL(`output/depth${i}.svg`, import.meta.url));
    await exec(t, ["-q", q, "-d", String(i), "-o", fullURL, inp]);
    t.snapshot(await readFile(fullURL, "utf8"));
    q += "Q";
  }
});

test("invalid options", async t => {
  const errorStream = new Buf();

  await exec(t, ["-d"], "commander.optionMissingArgument", {
    errorStream,
  });
  await exec(t, ["-d", "foo"], "commander.error", {
    errorStream,
  });
  await exec(t, ["-d", "-1"], "commander.error", {
    errorStream,
  });
  t.snapshot(errorStream.read());
});
