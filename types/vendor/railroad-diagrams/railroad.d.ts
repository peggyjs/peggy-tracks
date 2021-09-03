export default funcs;
export namespace Options {
    const DEBUG: boolean;
    const VS: number;
    const AR: number;
    const DIAGRAM_CLASS: string;
    const STROKE_ODD_PIXEL_LENGTH: boolean;
    const INTERNAL_ALIGNMENT: string;
    const CHAR_WIDTH: number;
    const COMMENT_CHAR_WIDTH: number;
}
export const defaultCSS: "\n\tsvg {\n\t\tbackground-color: hsl(30,20%,95%);\n\t}\n\tpath {\n\t\tstroke-width: 3;\n\t\tstroke: black;\n\t\tfill: rgba(0,0,0,0);\n\t}\n\ttext {\n\t\tfont: bold 14px monospace;\n\t\ttext-anchor: middle;\n\t\twhite-space: pre;\n\t}\n\ttext.diagram-text {\n\t\tfont-size: 12px;\n\t}\n\ttext.diagram-arrow {\n\t\tfont-size: 16px;\n\t}\n\ttext.label {\n\t\ttext-anchor: start;\n\t}\n\ttext.comment {\n\t\tfont: italic 12px monospace;\n\t}\n\tg.non-terminal text {\n\t\t/*font-style: italic;*/\n\t}\n\trect {\n\t\tstroke-width: 3;\n\t\tstroke: black;\n\t\tfill: hsl(120,100%,90%);\n\t}\n\trect.group-box {\n\t\tstroke: gray;\n\t\tstroke-dasharray: 10 5;\n\t\tfill: none;\n\t}\n\tpath.diagram-text {\n\t\tstroke-width: 3;\n\t\tstroke: black;\n\t\tfill: white;\n\t\tcursor: help;\n\t}\n\tg.diagram-text:hover path.diagram-text {\n\t\tfill: #eee;\n\t}";
export class FakeSVG {
    constructor(tagName: any, attrs: any, text: any);
    children: any;
    tagName: any;
    attrs: any;
    format(x: any, y: any, width: any): void;
    addTo(parent: any): any;
    toSVG(): any;
    toString(): string;
    walk(cb: any): void;
}
export class Path extends FakeSVG {
    constructor(x: any, y: any);
    m(x: any, y: any): Path;
    h(val: any): Path;
    right(val: any): Path;
    left(val: any): Path;
    v(val: any): Path;
    down(val: any): Path;
    up(val: any): Path;
    arc(sweep: any): Path;
    arc_8(start: any, dir: any): Path;
    l(x: any, y: any): Path;
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
}
export class Stack extends DiagramMultiContainer {
    constructor(...items: any[]);
    width: any;
    needsSpace: boolean;
    up: any;
    down: any;
    height: number;
}
export class OptionalSequence extends DiagramMultiContainer {
    constructor(...items: any[]);
    needsSpace: boolean;
    width: number;
    up: number;
    height: any;
    down: any;
}
export class AlternatingSequence extends DiagramMultiContainer {
    constructor(...items: any[]);
    needsSpace: boolean;
    up: any;
    down: any;
    height: number;
    width: number;
}
export class Choice extends DiagramMultiContainer {
    constructor(normal: any, ...items: any[]);
    normal: number;
    width: any;
    height: any;
    up: any;
    down: any;
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
}
export class Optional extends FakeSVG {
    constructor(item: any, skip: any);
}
export class OneOrMore extends FakeSVG {
    constructor(item: any, rep: any);
    item: FakeSVG;
    rep: FakeSVG;
    width: number;
    height: any;
    up: any;
    down: number;
    needsSpace: boolean;
}
export class ZeroOrMore extends FakeSVG {
}
export class Group extends FakeSVG {
    constructor(item: any, label: any);
    item: FakeSVG;
    label: FakeSVG;
    width: number;
    height: any;
    boxUp: number;
    up: number;
    down: number;
    needsSpace: boolean;
}
export class Start extends FakeSVG {
    constructor({ type, label }?: {
        type?: string;
        label: any;
    });
    width: number;
    height: number;
    up: number;
    down: number;
    type: string;
    label: string;
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
}
export class Terminal extends FakeSVG {
    constructor(text: any, { href, title, cls }?: {
        href: any;
        title: any;
        cls: any;
    });
    text: string;
    href: any;
    title: any;
    cls: any;
    width: number;
    height: number;
    up: number;
    down: number;
    needsSpace: boolean;
}
export class NonTerminal extends FakeSVG {
    constructor(text: any, { href, title, cls }?: {
        href?: any;
        title?: any;
        cls?: string;
    });
    text: string;
    href: any;
    title: any;
    cls: string;
    width: number;
    height: number;
    up: number;
    down: number;
    needsSpace: boolean;
}
export class Comment extends FakeSVG {
    constructor(text: any, { href, title, cls }?: {
        href?: any;
        title?: any;
        cls?: string;
    });
    text: string;
    href: any;
    title: any;
    cls: string;
    width: number;
    height: number;
    up: number;
    down: number;
    needsSpace: boolean;
}
export class Skip extends FakeSVG {
    constructor();
    width: number;
    height: number;
    up: number;
    down: number;
    needsSpace: boolean;
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
    function Comment(...args: any[]): Comment;
    function Skip(...args: any[]): Skip;
    function Block(...args: any[]): Block;
}
