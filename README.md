# peggy-tracks

`peggy-tracks` creates railroad track diagrams of [peggy](https://peggyjs.org/) grammars.

## Example

A quick example, generated with `peggy-tracks -s comment`:

![test](./test/output/comment.svg)

## Installation

```bash
npm install -g peggy-tracks
```

## Command line

```
Usage: peggy-tracks [options] [input_file]

Options:
  -s,--start <rule name>   Rule to start with
  -e,--expand              Expand rule references
  -o,--output <file name>  File in which to save ouptut
  -h, --help               display help for command
```
