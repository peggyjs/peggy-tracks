import {
  Choice,
  ComplexDiagram,
  Diagram,
  Group,
  NonTerminal,
  OneOrMore,
  Optional,
  Sequence,
  Terminal,
  ZeroOrMore,
} from "../vendor/railroad-diagrams/railroad.js";
import {
  regexpClassEscape,
  stringEscape,
} from "../vendor/peggy/utils.js";
import peggy from "peggy";

function cdata(txt) {
  return `<![CDATA[${txt.trim()}]]>`;
}

function findRule(grammar, name) {
  const ret = grammar.rules.find(r => r.name === name);
  if (!ret) {
    throw new Error(`Invalid rule name "${name}"`);
  }
  return ret;
}

const visit = peggy.compiler.visitor.build({
  action(node, context) {
    const child = visit(node.expression, context);
    if (context.opts.action) {
      const g = new Group(child, "[action]");
      g.label.title = node.code.trim();
      return g;
    }
    return child;
  },
  any() {
    return new Terminal(".");
  },
  choice(node, context) {
    return new Choice(0, ...node.alternatives.map(a => visit(a, context)));
  },
  class(node) {
    const parts = node.parts.map(([start, end]) => end
      ? `${regexpClassEscape(start)}-${regexpClassEscape(end)}`
      : regexpClassEscape(start));
    return new Terminal(`[${parts.join("")}]`);
  },
  literal(node) {
    return new Terminal(`"${stringEscape(node.value)}"`);
  },
  one_or_more(node, context) {
    return new OneOrMore(visit(node.expression, context));
  },
  optional(node, context) {
    return new Optional(visit(node.expression, context));
  },
  rule(node, context) {
    const desc = node.expression.type === "named"
      ? `${node.name}(${node.expression.name})`
      : node.name;
    return new Group(visit(node.expression, context), desc);
  },
  rule_ref(node, context) {
    return context.opts.expand
      ? visit(findRule(context.grammar, node.name), context)
      : new Terminal(node.name);
  },
  semantic_and(node) {
    return new NonTerminal("&{...}", { title: cdata(node.code) });
  },
  semantic_not(node) {
    return new NonTerminal("!{...}", { title: cdata(node.code) });
  },
  simple_and(node, context) {
    return new Sequence(new NonTerminal("&"), visit(node.expression, context));
  },
  simple_not(node, context) {
    return new Sequence(new NonTerminal("!"), visit(node.expression, context));
  },
  sequence(node, context) {
    return new Sequence(...node.elements.map(e => visit(e, context)));
  },
  zero_or_more(node, context) {
    return new ZeroOrMore(visit(node.expression, context));
  },
});

export function tracks(opts) {
  const context = {
    opts,
    grammar: peggy.parser.parse(opts.text, opts.parserOptions),
  };
  if (opts.start) {
    const root = findRule(context.grammar, opts.start);
    return new ComplexDiagram(visit(root, context));
  } else {
    const root = context.grammar.rules[0];
    return new Diagram(visit(root, context));
  }
}
