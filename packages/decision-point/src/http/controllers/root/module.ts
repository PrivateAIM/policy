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
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    DBody, DController, DPost, DResponse, DTags,
} from '@routup/decorators';
import { useCoreClient } from '../../../services';
import { EvaluationExecutionRequestPayload } from './types';
import { EvaluationValidator } from './validator';

@DTags('core')
@DController('')
export class RootController {
    protected policyEngine : PolicyEngine;

    constructor() {
        this.policyEngine = new PolicyEngine();
    }

    @DPost('/', [ForceLoggedInMiddleware])
    async execute(
        @DResponse() response: Response,
            @DBody() input: EvaluationExecutionRequestPayload,
    ): Promise<void> {
        const evaluationValidator = new EvaluationValidator();
        const data = await evaluationValidator.run(input);

        const authupClient = useAuthupClient();
        const coreClient = useCoreClient();

        try {
            if (data.permission_name) {
                const permission = await authupClient.permission.getOne(data.permission_name);
                data.permission_id = permission.id;
            }
        } catch (e) {
            if (isClientErrorWithStatusCode(e, 404)) {
                throw new BadRequestError('The permission was not found.');
            }

            throw e;
        }

        const { data: analysisPermissions } = await coreClient.analysisPermission.getMany({
            filter: {
                permission_id: data.permission_id,
                analysis_id: data.analysis_id,
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

            const output = this.policyEngine.evaluate(policy, input.data);
            if (!output) {
                throw new BadRequestError('The permission cannot be used by the analysis.');
            }
        }

        return sendAccepted(response);
    }
}
