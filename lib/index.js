import {
  Choice,
  Comment,
  ComplexDiagram,
  Decision,
  Diagram,
  Group,
  NonTerminal,
  OneOrMore,
  Optional,
  Sequence,
  Terminal,
  ZeroOrMore,
  defaultCSS,
} from "../vendor/railroad-diagrams/railroad.js";
import {
  regexpClassEscape,
  stringEscape,
} from "peggy/lib/compiler/utils.js";
import asts from "peggy/lib/compiler/asts.js";
import peggy from "peggy";

/**
 * The options that can be passed into tracks
 *
 * @typedef {object} TrackOptions
 * @property {string} text The grammar text to parse.
 * @property {string} [start] The rule name to start with.
 *   Defaults to first rule in the grammar.
 * @property {boolean} [action=false] Create action blocks.
 * @property {boolean} [expand=false] Expand rule references.
 * @property {object} parserOptions Peggy parser options.  Most important
 *   is "grammarSource".
 */

/**
 * CDATA escape.
 *
 * @param {string} txt
 * @return {string}
 * @ignore
 */
function cdata(txt) {
  return `<![CDATA[${txt.trim()}]]>`;
}

// Only exported for testing.
export function wrapCount(m, defaultValue = "0") {
  switch (m?.type) {
    case "function":
      return new Decision("&{...}", { title: cdata(m.value) });
    case "constant":
      return new Comment(m.value ?? defaultValue);
    case "variable":
      return new NonTerminal(m.value);
    default:
      return null;
  }
}

const visit = peggy.compiler.visitor.build({
  action(node, context) {
    const child = visit(node.expression, context);
    if (context.opts.action) {
      const label = new Comment("[action]", {
        title: node.code.trim(),
        cls: "action",
      });
      const g = new Group(child, { label, cls: "action" });
      return g;
    }
    return child;
  },
  any() {
    return new Terminal(".", { cls: "any" });
  },
  choice(node, context) {
    return new Choice(0, ...node.alternatives.map(a => visit(a, context)));
  },
  class(node) {
    const parts = node.parts.map(([start, end]) => (end
      ? `${regexpClassEscape(start)}-${regexpClassEscape(end)}`
      : regexpClassEscape(start)));
    return new Terminal(
      `[${node.inverted ? "^" : ""}${parts.join("")}]${node.ignoreCase ? "i" : ""}`,
      { cls: "class" }
    );
  },
  literal(node) {
    return new Terminal(
      `"${stringEscape(node.value)}"${node.ignoreCase ? "i" : ""}`,
      { cls: "literal" }
    );
  },
  one_or_more(node, context) {
    return new OneOrMore(visit(node.expression, context));
  },
  optional(node, context) {
    return new Optional(visit(node.expression, context));
  },
  repeated(node, context) {
    const min = wrapCount(node.min);
    const max = wrapCount(node.max, "∞");

    let rep = null;
    if (node.delimiter) {
      if (node.delimiter.type === "sequence") {
        rep = new Group(visit(node.delimiter, context), {
          label: "delimiter",
          cls: "delimiter",
        });
      } else {
        rep = visit(node.delimiter, context);
      }
    }

    if (node.min.type === "constant" && !node.min.value) {
      return new ZeroOrMore(
        visit(node.expression, context),
        { rep, min, max }
      );
    }
    return new OneOrMore(
      visit(node.expression, context),
      { rep, min, max }
    );
  },
  rule(node, context) {
    const label = node.expression.type === "named"
      ? `${node.name}(${node.expression.name})`
      : node.name;
    return new Group(visit(node.expression, context), {
      label,
      cls: "rule",
    });
  },
  rule_ref(node, context) {
    return context.opts.expand
      ? visit(asts.findRule(context.grammar, node.name), context)
      : new NonTerminal(node.name, { cls: "rule-ref" });
  },
  library_ref(node) {
    return new NonTerminal(`${node.library}.${node.name}`, { cls: "library_ref" });
  },
  semantic_and(node) {
    return new Decision("&{...}", { title: cdata(node.code), cls: "semantic-and" });
  },
  semantic_not(node) {
    return new Decision("!{...}", { title: cdata(node.code), cls: "semantic-not" });
  },
  simple_and(node, context) {
    return new Sequence(new Decision("&", { cls: "simple-and" }), visit(node.expression, context));
  },
  simple_not(node, context) {
    return new Sequence(new Decision("!", { cls: "simple-and" }), visit(node.expression, context));
  },
  sequence(node, context) {
    return new Sequence(...node.elements.map(e => visit(e, context)));
  },
  zero_or_more(node, context) {
    return new ZeroOrMore(visit(node.expression, context));
  },
});

/**
 * Generate a railroad track diagram from a grammer
 *
 * @param {TrackOptions} opts
 * @return {Diagram|ComplexDiagram
 }
 */
export function tracks(opts) {
  const context = {
    opts,
    grammar: peggy.parser.parse(opts.text, opts.parserOptions),
  };
  if (opts.start) {
    const root = asts.findRule(context.grammar, opts.start);
    return new ComplexDiagram(visit(root, context));
  } else {
    const root = context.grammar.rules[0];
    return new Diagram(visit(root, context));
  }
}

export { defaultCSS };
