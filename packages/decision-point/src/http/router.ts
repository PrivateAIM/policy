/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MiddlewareSwaggerOptions } from '@privateaim/server-http-kit';
import {
    mountAuthupMiddleware,
    mountBasicMiddleware,
    mountCorsMiddleware,
    mountDecoratorsMiddleware,
    mountErrorMiddleware,
    mountSwaggerMiddleware,
} from '@privateaim/server-http-kit';
import {
    isAuthupClientUsable,
    isRedisClientUsable,
    isVaultClientUsable,
    useAuthupClient,
    useRedisClient,
    useVaultClient,
} from '@privateaim/server-kit';
import { Router, coreHandler } from 'routup';
import { useEnv } from '../config';
import { RootController } from './controllers';

export function createHTTPRouter() : Router {
    const router = new Router();

    let swagger : MiddlewareSwaggerOptions = {};
    if (useEnv('env') !== 'test') {
        swagger = {
            baseURL: useEnv('publicURL'),
        };
    }

    mountBasicMiddleware(router);

    mountCorsMiddleware(router);

    mountAuthupMiddleware(router, {
        client: isAuthupClientUsable() ?
            useAuthupClient() :
            undefined,
        vaultClient: isVaultClientUsable() ?
            useVaultClient() :
            undefined,
        redisClient: isRedisClientUsable() ?
            useRedisClient() :
            undefined,
        fakeAbilities: useEnv('env') === 'test',
    });

    mountSwaggerMiddleware(router, swagger);

    mountDecoratorsMiddleware(router, {
        controllers: [
            RootController,
        ],
    });

    mountErrorMiddleware(router);

    router.get('/', coreHandler(() => ({
        timestamp: Date.now(),
    })));

    return router;
}
