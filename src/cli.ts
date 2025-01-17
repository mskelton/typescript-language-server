#!/usr/bin/env node
/*
 * Copyright (C) 2017, 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { readFileSync } from 'node:fs';
import { Command } from 'commander';
import lsp from 'vscode-languageserver';
import { createLspConnection } from './lsp-connection.js';
import { TsServerLogLevel } from './utils/configuration.js';

const DEFAULT_LOG_LEVEL = lsp.MessageType.Info;
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), { encoding: 'utf8' }));

const program = new Command('typescript-language-server')
    .version(version)
    .requiredOption('--stdio', 'use stdio')
    .option('--log-level <logLevel>', 'A number indicating the log level (4 = log, 3 = info, 2 = warn, 1 = error). Defaults to `2`.')
    .option('--tsserver-log-verbosity <tsserverLogVerbosity>', 'Specify a tsserver log verbosity (terse, normal, verbose). Defaults to `normal`.' +
      ' example: --tsserver-log-verbosity verbose')
    .option('--tsserver-path <path>', 'Specify path to tsserver directory. example: --tsserver-path=/Users/me/typescript/lib/')
    .parse(process.argv);

const options = program.opts();

let tsserverLogVerbosity = TsServerLogLevel.fromString(options.tsserverLogVerbosity);

if (options.tsserverLogFile && tsserverLogVerbosity === TsServerLogLevel.Off) {
    tsserverLogVerbosity = TsServerLogLevel.Normal;
}

let logLevel = DEFAULT_LOG_LEVEL;
if (options.logLevel) {
    logLevel = parseInt(options.logLevel, 10);
    if (logLevel && (logLevel < 1 || logLevel > 4)) {
        console.error(`Invalid '--log-level ${logLevel}'. Falling back to 'info' level.`);
        logLevel = DEFAULT_LOG_LEVEL;
    }
}

createLspConnection({
    tsserverPath: options.tsserverPath as string,
    tsserverLogVerbosity,
    showMessageLevel: logLevel as lsp.MessageType,
}).listen();
