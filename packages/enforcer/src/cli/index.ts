/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { cac } from 'cac';
import { mountCLIStartCommand } from './commands';

const cli = cac();

mountCLIStartCommand(cli);

cli.help();

// todo: read package.json version attribute
cli.version('0.0.0');

cli.parse();
