/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientErrorWithStatusCode } from 'hapic';
import { PolicyEngine } from '@privateaim/policy-kit';
import { BadRequestError } from '@ebec/http';
import { useAuthupClient } from '@privateaim/server-kit';
import { Response, sendAccepted } from 'routup';
import { z } from 'zod';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    DBody, DController, DPath, DPost, DResponse, DTags,
} from '@routup/decorators';
import { useCoreClient } from '../../../services';
import { buildErrorMessageForZodError } from '../../../utils';
import { EvaluationExecutionRequestPayload } from './types';

const schema = z.object({
    permission: z.string(),
    data: z.object({}),
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
        @DResponse() response: Response,
            @DBody() payload: EvaluationExecutionRequestPayload,
            @DPath('id') id: string,
    ): Promise<void> {
        const parsed = schema.safeParse(payload);
        if (!parsed.success) {
            throw new BadRequestError(buildErrorMessageForZodError(parsed.error));
        }

        const authupClient = useAuthupClient();
        const coreClient = useCoreClient();

        let permissionId: string | undefined;
        try {
            const permission = await authupClient.permission.getOne(payload.permission);
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
            throw new BadRequestError('The permission is not assigned to the provided analysis.');
        }

        if (analysisPermission.policy_id) {
            const policy = await authupClient.policy.getOne(analysisPermission.policy_id);

            const output = this.policyEngine.evaluate(policy, payload.data);
            if (!output) {
                throw new BadRequestError('The permission cannot be used by the analysis.');
            }
        }

        return sendAccepted(response);
    }
}
