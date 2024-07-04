/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ZodError } from 'zod';

export function buildErrorMessageForZodError(error: ZodError) {
    const names: string[] = [];
    for (let i = 0; i < error.issues.length; i++) {
        for (let j = 0; j < error.issues[i].path.length; j++) {
            names.push(`${error.issues[i].path[j]}`);
        }
    }

    if (names.length > 1) {
        return `The attributes ${names.join(', ')} are invalid.`;
    }
    return `The attributes ${String(names[0])} is invalid.`;
}
