/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Factory } from 'singa';
import { singa } from 'singa';
import type { Client } from '@privateaim/core-http-kit';

const instance = singa<Client>({
    name: 'core',
});

export function setCoreClientFactory(factory: Factory<Client>) {
    instance.setFactory(factory);
}

export function isCoreClientUsable() {
    return instance.has() || instance.hasFactory();
}

export function useCoreClient() {
    return instance.use();
}
