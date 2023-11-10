export default funcs;
export namespace Options {
    let DEBUG: boolean;
    let VS: number;
    let AR: number;
    let DIAGRAM_CLASS: string;
    let STROKE_ODD_PIXEL_LENGTH: boolean;
    let INTERNAL_ALIGNMENT: string;
    let CHAR_WIDTH: number;
    let COMMENT_CHAR_WIDTH: number;
}
export const defaultCSS: "\n  svg {\n    background-color: hsl(30,20%,95%);\n  }\n  path {\n    stroke-width: 3;\n    stroke: black;\n    fill: rgba(0,0,0,0);\n  }\n  text {\n    font: bold 14px monospace;\n    text-anchor: middle;\n    white-space: pre;\n  }\n  text.diagram-text {\n    font-size: 12px;\n  }\n  text.diagram-arrow {\n    font-size: 16px;\n  }\n  text.label {\n    text-anchor: start;\n  }\n  text.comment {\n    font: italic 12px monospace;\n  }\n  g.non-terminal text {\n    /*font-style: italic;*/\n  }\n  rect {\n    stroke-width: 3;\n    stroke: black;\n    fill: hsl(120,100%,90%);\n  }\n  rect.group-box {\n    stroke: gray;\n    stroke-dasharray: 10 5;\n    fill: none;\n  }\n  path.diagram-text {\n    stroke-width: 3;\n    stroke: black;\n    fill: white;\n    cursor: help;\n  }\n  .decision path {\n    fill: #ccc;\n  }\n  g.diagram-text:hover path.diagram-text {\n    fill: #eee;\n  }\n  text.repeat-text {\n    font: italic 12px monospace;\n    text-anchor: end;\n  }\n  .repeat-box > rect.group-box {\n    stroke: gray;\n    stroke-width: 2;\n    stroke-dasharray: 1 5;\n    fill: none;\n  }\n  .delimiter > rect.group-box {\n    stroke: gray;\n    stroke-width: 2;\n    stroke-dasharray: 1 5;\n    fill: none;\n  }\n";
export class FakeSVG {
    constructor(tagName: any, attrs?: {}, text?: any[]);
    tagName: any;
    attrs: {};
    children: any[];
    format(x: any, y: any, width: any): void;
    addTo(parent: any): any;
    toSVG(): any;
    toString(): string;
    walk(cb: any): void;
}
export class Path extends FakeSVG {
    constructor(x: any, y: any, attr: any);
    m(x: any, y: any): this;
    h(val: any): this;
    right(val: any): this;
    left(val: any): this;
    v(val: any): this;
    down(val: any): this;
    up(val: any): this;
    arc(sweep: any): this;
    arc_8(start: any, dir: any): this;
    l(x: any, y: any): this;
    format(): this;
}
export class DiagramMultiContainer extends FakeSVG {
    constructor(tagName: any, items: any, attrs: any, text: any);
    items: any;
}
export class Diagram extends DiagramMultiContainer {
    constructor(...items: any[]);
    up: number;
    down: number;
    height: number;
    width: number;
    formatted: boolean;
    format(paddingt: any, paddingr: any, paddingb: any, paddingl: any): this;
    toString(): any;
    toStandalone(style: any): any;
}
export class ComplexDiagram extends FakeSVG {
    constructor(...items: any[]);
}
export class Sequence extends DiagramMultiContainer {
    constructor(...items: any[]);
    needsSpace: boolean;
    up: number;
    down: number;
    height: number;
    width: number;
    format(x: any, y: any, width: any): this;
}
export class Stack extends DiagramMultiContainer {
    constructor(...items: any[]);
    width: any;
    needsSpace: boolean;
    up: any;
    down: any;
    height: number;
    format(x: any, y: any, width: any): this;
}
export class OptionalSequence extends DiagramMultiContainer {
    constructor(...items: any[]);
    needsSpace: boolean;
    width: number;
    up: number;
    height: any;
    down: any;
    format(x: any, y: any, width: any): this;
}
export class AlternatingSequence extends DiagramMultiContainer {
    constructor(...items: any[]);
    needsSpace: boolean;
    up: any;
    down: any;
    height: number;
    width: number;
    format(x: any, y: any, width: any): this;
}
export class Choice extends DiagramMultiContainer {
    constructor(normal: any, ...items: any[]);
    normal: number;
    width: any;
    height: any;
    up: any;
    down: any;
    format(x: any, y: any, width: any): this;
}
export class HorizontalChoice extends DiagramMultiContainer {
    constructor(...items: any[]);
    needsSpace: boolean;
    width: number;
    height: number;
    _upperTrack: number;
    up: number;
    _lowerTrack: number;
    down: number;
    format(x: any, y: any, width: any): this;
}
export class MultipleChoice extends DiagramMultiContainer {
    constructor(normal: any, type: any, ...items: any[]);
    normal: number;
    type: any;
    needsSpace: boolean;
    innerWidth: any;
    width: any;
    up: any;
    down: any;
    height: any;
    format(x: any, y: any, width: any): this;
}
export class Optional extends FakeSVG {
    constructor(item: any, skip: any);
}
export class OneOrMore extends FakeSVG {
    constructor(item: any, { rep, min, max }?: {
        rep?: any;
        min?: any;
        max?: any;
    });
    item: FakeSVG;
    rep: FakeSVG;
    min: any;
    max: any;
    dots: Comment | Null;
    extra: any;
    width: any;
    height: any;
    up: number;
    down: number;
    needsSpace: boolean;
    format(x: any, y: any, width: any): this;
}
export class ZeroOrMore extends FakeSVG {
    constructor(item: any, { rep, skip, min, max }?: {
        rep?: any;
        skip?: any;
        min?: any;
        max?: any;
    });
}
export class Group extends FakeSVG {
    constructor(item: any, { label, cls }?: {
        label?: any;
        cls?: any;
    });
    item: FakeSVG;
    label: FakeSVG;
    width: number;
    height: any;
    boxUp: number;
    up: number;
    down: number;
    needsSpace: boolean;
    format(x: any, y: any, width: any): this;
}
export class Start extends FakeSVG {
    constructor({ type, label }?: {
        type?: string;
        label?: any;
    });
    width: number;
    height: number;
    up: number;
    down: number;
    type: string;
    label: string;
    format(x: any, y: any): this;
}
export class End extends FakeSVG {
    constructor({ type }?: {
        type?: string;
    });
    width: number;
    height: number;
    up: number;
    down: number;
    type: string;
    format(x: any, y: any): this;
}
export class Terminal extends FakeSVG {
    constructor(text: any, { href, title, cls, noLines }?: {
        href?: any;
        title?: any;
        cls?: any;
        noLines?: any;
    });
    text: string;
    href: any;
    title: any;
    noLines: any;
    width: number;
    height: number;
    up: number;
    down: number;
    needsSpace: boolean;
    format(x: any, y: any, width: any): this;
}
export class NonTerminal extends FakeSVG {
    constructor(text: any, { href, title, cls, noLines }?: {
        href?: any;
        title?: any;
        cls?: any;
        noLines?: any;
    });
    text: string;
    href: any;
    title: any;
    noLines: any;
    width: number;
    height: number;
    up: number;
    down: number;
    needsSpace: boolean;
    format(x: any, y: any, width: any): this;
}
export class Decision extends FakeSVG {
    constructor(text: any, { href, title, cls, noLines }?: {
        href?: any;
        title?: any;
        cls?: any;
        noLines?: any;
    });
    text: string;
    href: any;
    title: any;
    noLines: any;
    width: number;
    height: number;
    up: number;
    down: number;
    needsSpace: boolean;
    format(x: any, y: any, width: any): this;
}
export class Comment extends FakeSVG {
    constructor(text: any, { href, title, cls, noLines }?: {
        href?: any;
        title?: any;
        cls?: any;
        noLines?: any;
    });
    text: string;
    href: any;
    title: any;
    noLines: any;
    width: number;
    height: number;
    up: number;
    down: number;
    needsSpace: boolean;
    format(x: any, y: any, width: any): this;
}
export class Skip extends FakeSVG {
    constructor();
    width: number;
    height: number;
    up: number;
    down: number;
    needsSpace: boolean;
    format(x: any, y: any, width: any): this;
}
export class Null extends FakeSVG {
    constructor();
    width: number;
    height: number;
    up: number;
    down: number;
    needsSpace: boolean;
    format(x: any, y: any, width: any): this;
    addTo(parent: any): this;
}
export class Block extends FakeSVG {
    constructor({ width, up, height, down, needsSpace }?: {
        width?: number;
        up?: number;
        height?: number;
        down?: number;
        needsSpace?: boolean;
    });
    width: number;
    height: number;
    up: number;
    down: number;
    needsSpace: boolean;
    format(x: any, y: any, width: any): this;
}
declare namespace funcs {
    function Diagram(...args: any[]): Diagram;
    function ComplexDiagram(...args: any[]): ComplexDiagram;
    function Sequence(...args: any[]): Sequence;
    function Stack(...args: any[]): Stack;
    function OptionalSequence(...args: any[]): OptionalSequence;
    function AlternatingSequence(...args: any[]): AlternatingSequence;
    function Choice(...args: any[]): Choice;
    function HorizontalChoice(...args: any[]): HorizontalChoice;
    function MultipleChoice(...args: any[]): MultipleChoice;
    function Optional(...args: any[]): Optional;
    function OneOrMore(...args: any[]): OneOrMore;
    function ZeroOrMore(...args: any[]): ZeroOrMore;
    function Group(...args: any[]): Group;
    function Start(...args: any[]): Start;
    function End(...args: any[]): End;
    function Terminal(...args: any[]): Terminal;
    function NonTerminal(...args: any[]): NonTerminal;
    function Decision(...args: any[]): Decision;
    function Comment(...args: any[]): Comment;
    function Skip(...args: any[]): Skip;
    function Block(...args: any[]): Block;
}
