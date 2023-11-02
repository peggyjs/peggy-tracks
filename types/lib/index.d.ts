/**
 * Generate a railroad track diagram from a grammer
 *
 * @param {TrackOptions} opts
 * @return {Diagram|ComplexDiagram
 }
 */
export function tracks(opts: TrackOptions): Diagram | ComplexDiagram;
export { defaultCSS };
/**
 * The options that can be passed into tracks
 */
export type TrackOptions = {
    /**
     * The grammar text to parse.
     */
    text: string;
    /**
     * The rule name to start with.
     * Defaults to first rule in the grammar.
     */
    start?: string;
    /**
     * Create action blocks.
     */
    action?: boolean;
    /**
     * Expand rule references.
     */
    expand?: boolean;
    /**
     * Peggy parser options.  Most important
     * is "grammarSource".
     */
    parserOptions: object;
};
import { Diagram } from "../vendor/railroad-diagrams/railroad.js";
import { ComplexDiagram } from "../vendor/railroad-diagrams/railroad.js";
import { defaultCSS } from "../vendor/railroad-diagrams/railroad.js";
