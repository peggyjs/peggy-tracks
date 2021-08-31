#! /usr/bin/env node

import CLI from "../lib/cli.js";

new CLI().main().catch(console.error);
