/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/adapter-zod';
import { Container } from 'validup';
import { z } from 'zod';
import type { EvaluationExecutionRequestPayload } from './types';

export class EvaluationValidator extends Container<EvaluationExecutionRequestPayload> {
    constructor() {
        super();

        this.mountAll();
    }

    mountAll() {
        const permission = new Container({
            oneOf: true,
        });

        permission.mount('permission_id', createValidator(z.string().uuid()));
        permission.mount('permission_name', createValidator(z.string()));

        this.mount(permission);

        this.mount('analysis_id', createValidator(z.string().uuid()));

        this.mount('data', createValidator(z.object({})));
    }
}
