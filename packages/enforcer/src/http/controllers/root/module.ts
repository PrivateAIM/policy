/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientErrorWithStatusCode } from 'hapic';
import { PolicyEngine } from '@authup/kit';
import { BadRequestError } from '@ebec/http';
import { useAuthupClient } from '@privateaim/server-kit';
import { z } from 'zod';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    DBody, DController, DPath, DPost, DTags,
} from '@routup/decorators';
import { useCoreClient } from '../../../services';
import { buildErrorMessageForZodError } from '../../../utils';
import { EvaluationExecutionRequestPayload, EvaluationExecutionResponse } from './types';

const schema = z.object({
    permission: z.string(),
    context: z.object({}),
});

@DTags('core')
@DController('')
export class RootController {
    protected policyEngine : PolicyEngine;

    constructor() {
        this.policyEngine = new PolicyEngine();
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async execute(
        @DBody() data: EvaluationExecutionRequestPayload,
            @DPath('id') id: string,
    ): Promise<EvaluationExecutionResponse> {
        const parsed = schema.safeParse(data);
        if (!parsed.success) {
            throw new BadRequestError(buildErrorMessageForZodError(parsed.error));
        }

        const authupClient = useAuthupClient();
        const coreClient = useCoreClient();

        let permissionId: string | undefined;
        try {
            const permission = await authupClient.permission.getOne(data.permission);
            permissionId = permission.id;
        } catch (e) {
            if (isClientErrorWithStatusCode(e, 404)) {
                throw new BadRequestError('The permission was not found.');
            }

            throw e;
        }

        const { data: analysisPermissions } = await coreClient.analysisPermission.getMany({
            filter: {
                permission_id: permissionId,
                analysis_id: id,
            },
            page: {
                limit: 1,
            },
        });

        const [analysisPermission] = analysisPermissions;
        if (typeof analysisPermission === 'undefined') {
            return {
                success: false,
                message: 'The permission is not assigned to the provided analysis.',
            };
        }

        if (analysisPermission.policy_id) {
            const policy = await authupClient.policy.getOne(analysisPermission.policy_id);

            try {
                const output = this.policyEngine.evaluate(policy, data.context);
                return {
                    success: output,
                };
            } catch (e) {
                return {
                    success: false,
                    message: e instanceof Error ?
                        e.message :
                        undefined,
                };
            }
        }

        return {
            success: true,
        };
    }
}
