import fs from "fs";
import test from "ava";
import { tracks } from "../lib/index.js";

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
    start: "top",
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
