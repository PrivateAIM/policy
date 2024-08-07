/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { cac } from 'cac';
import { config } from 'dotenv';
import path from 'node:path';
import { mountCLISeedCommand, mountCLIStartCommand } from './commands';

config({
    debug: false,
    path: path.resolve(process.cwd(), '.env'),
});

const cli = cac();

mountCLISeedCommand(cli);
mountCLIStartCommand(cli);

cli.help();

// todo: read package.json version attribute
cli.version('0.0.0');

cli.parse();
