/**
 * The command line interface for peggy-tracks, abstracted to make it testable
 * without having to fork/exec a bunch of small child processes.
 * Call .exitOverride() if you would like an exception thrown from main() rather
 * than having the process exit.
 */
export default class CliCommand extends Command {
    constructor();
    /**
     * Where to get input if an input file isn't specified.
     *
     * @type {NodeJS.ReadStream}
     */
    defaultInputStream: NodeJS.ReadStream;
    /**
     * Where to send output if an output file isn't specified.  Also used for
     * Commander help output.
     *
     * @type {NodeJS.WriteStream}
     */
    defaultOutputStream: NodeJS.WriteStream;
    /**
     * Where to send error text, including that from Commander.
     *
     * @type {NodeJS.WriteStream}
     */
    errorStream: NodeJS.WriteStream;
    /**
     * Run the main program with the arguments provided.  Only guaranteed to
     * work the first time.
     *
     * @param {string[]} [argv] - If not specified, uses process.argv.  Assumed
     *   to be in "node" format, with the node binary name as argv[0] and the
     *   name of the running script as argv[1].
     * @return {Promise<void>}
     */
    main(argv?: string[]): Promise<void>;
}
import { Command } from "commander";
