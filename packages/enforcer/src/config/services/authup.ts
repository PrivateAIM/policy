/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenCreatorOptions } from '@authup/core-http-kit';
import { mountClientResponseErrorTokenHook } from '@authup/core-http-kit';
import type { ConnectionString } from '@authup/core-kit';
import { parseConnectionString } from '@authup/core-kit';
import {
    AuthupClient,
    setAuthupClientFactory,
} from '@privateaim/server-kit';
import { useEnv } from '../env';

export function useAuthupConnectionOptions() : ConnectionString {
    const baseURL = useEnv('authupURL');
    const connection = parseConnectionString(baseURL);
    if (!connection) {
        throw new Error('The authup connection url could not be parsed.');
    }

    if (connection.type === 'client') {
        throw new Error('Client authentication is disabled.');
    }

    return connection;
}

export function configureAuthupClient() {
    const connection = useAuthupConnectionOptions();

    setAuthupClientFactory(() => {
        const client = new AuthupClient({
            baseURL: connection.url,
        });

        let tokenCreator : TokenCreatorOptions | undefined;
        if (connection.type === 'user') {
            tokenCreator = {
                type: 'user',
                name: connection.name,
                password: connection.password,
            };
        } else if (connection.type === 'robot') {
            tokenCreator = {
                type: 'robot',
                id: connection.name,
                secret: connection.password,
            };
        }

        if (tokenCreator) {
            mountClientResponseErrorTokenHook(client, {
                baseURL: client.getBaseURL(),
                tokenCreator,
            });
        }

        return client;
    });
}
