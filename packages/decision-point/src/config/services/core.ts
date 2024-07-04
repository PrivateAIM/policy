/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { TokenCreatorOptions } from '@authup/core-http-kit';
import { mountClientResponseErrorTokenHook } from '@authup/core-http-kit';
import { Client } from '@privateaim/core-http-kit';
import { setCoreClientFactory } from '../../services';
import { useEnv } from '../env';
import { useAuthupConnectionOptions } from './authup';

export function configureCoreClient(): void {
    const baseURL = useEnv('coreURL');
    const authupConnectionOptions = useAuthupConnectionOptions();

    setCoreClientFactory(() => {
        const client = new Client({ baseURL });

        let tokenCreator : TokenCreatorOptions | undefined;
        if (authupConnectionOptions.type === 'user') {
            tokenCreator = {
                type: 'user',
                name: authupConnectionOptions.name,
                password: authupConnectionOptions.password,
            };
        } else if (authupConnectionOptions.type === 'robot') {
            tokenCreator = {
                type: 'robot',
                id: authupConnectionOptions.name,
                secret: authupConnectionOptions.password,
            };
        }

        if (tokenCreator) {
            mountClientResponseErrorTokenHook(client, {
                baseURL: authupConnectionOptions.url,
                tokenCreator,
            });
        }

        return client;
    });
}
