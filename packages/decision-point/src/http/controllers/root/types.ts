/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PolicyEvaluationContext } from '@authup/kit';

export type EvaluationExecutionRequestPayload = {
    permission_name?: string,
    permission_id?: string,

    analysis_id: string,

    data: PolicyEvaluationContext
};
