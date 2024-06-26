/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { WRITABLE_DIRECTORY } from '../constants';
import {
    configureAuthupClient,
    configureCoreClient,
    configureLoggerClient,
    configureRedisClient,
} from './services';

export function configure() {
    configureLoggerClient({
        directory: WRITABLE_DIRECTORY,
    });

    configureAuthupClient();

    configureCoreClient();

    configureRedisClient();
}
