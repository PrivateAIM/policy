/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export interface Environment {
    env: string,
    port: number,

    redisConnectionString?: string | boolean,
    rabbitMqConnectionString?: string | boolean,
    harborURL?: string,

    publicURL: string,
    authupURL: string,
    coreURL: string,
}
