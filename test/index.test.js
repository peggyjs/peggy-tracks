import { tracks, wrapCount } from "../lib/index.js";
import fs from "fs";
import test from "ava";

test("it tracks", t => {
  const diag = tracks({
    text: "bar = foo\nfoo = '1'",
  });
  t.truthy(diag);
  t.is(typeof diag.toStandalone, "function");
});

test("it finds bad rules", t => {
  t.throws(() => tracks({ text: "foo = '1'", start: "bar" }));
});

test("produces one of each", async t => {
  const f = new URL("test.peggy", import.meta.url);
  const text = await fs.promises.readFile(f, "utf8");
  const diag = tracks({
    text,
    expand: true,
    start: "Top",
  });
  t.truthy(diag);
});

test("actions", t => {
  const diag = tracks({
    action: true,
    text: "bar = '1' { return 1 }",
  });
  t.truthy(diag);
  t.regex(diag.toStandalone(), /<title>return 1<\/title>/);
});

test("wrapCount", t => {
  t.is(wrapCount(null), null);
});

test("it handles single-value repeats", t => {
  const diag = tracks({ text: "x = 'x'|2|" });
  t.snapshot(diag.toStandalone());
});

