/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { WRITABLE_DIRECTORY } from '../constants';
import {
    configureAuthup,
    configureRedis,
    setupLogger,
} from './services';

export function configure() {
    setupLogger({
        directory: WRITABLE_DIRECTORY,
    });

    configureAuthup();

    configureRedis();
}
