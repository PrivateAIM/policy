/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import {
    oneOf, orFail,
    read,
    readBool,
    readInt,
} from 'envix';
import { config } from 'dotenv';
import type { Environment } from './types';

config({
    debug: false,
    path: path.resolve(__dirname, '..', '..', '..', '.env'),
});

let instance : Environment | undefined;

export function useEnv() : Environment;
export function useEnv<K extends keyof Environment>(key: K) : Environment[K];
export function useEnv(key?: string) : any {
    if (typeof instance !== 'undefined') {
        if (typeof key === 'string') {
            return instance[key as keyof Environment];
        }

        return instance;
    }

    const port = readInt('PORT', 3000);
    instance = {
        env: read('NODE_ENV', 'development'),
        port,

        redisConnectionString: oneOf([
            readBool('REDIS_CONNECTION_STRING'),
            read('REDIS_CONNECTION_STRING'),
        ]),

        publicURL: read('PUBLIC_URL', `http://127.0.0.1:${port}/`),
        authupURL: orFail(read('AUTHUP_URL')),
        coreURL: orFail(read('CORE_URL')),
    };

    if (typeof key === 'string') {
        return instance[key as keyof Environment];
    }

    return instance;
}
