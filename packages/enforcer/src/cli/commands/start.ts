/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CAC } from 'cac';
import { configure } from '../../config';

export function mountCLIStartCommand(cli: CAC) {
    cli
        .command('start')
        .action(async () => {
            configure();

            console.log('Hello, world!');
        });
}
