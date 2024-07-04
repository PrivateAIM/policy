/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Permission, Policy } from '@authup/core-kit';
import type { AttributesPolicy } from '@authup/kit';
import { BuiltInPolicyType } from '@authup/kit';
import type { AnalysisPermission } from '@privateaim/core-kit';
import { useAuthupClient, useLogger } from '@privateaim/server-kit';
import type { CAC } from 'cac';
import { isClientErrorWithStatusCode } from 'hapic';
import { configure } from '../../config';
import { useCoreClient } from '../../services';

export function mountCLISeedCommand(cli: CAC) {
    cli
        .command('seed [id]')
        .action(async (id: string) => {
            configure();

            const PERMISSION_NAME = 'analysis_endpoint_access';

            const logger = useLogger();
            const coreClient = useCoreClient();
            const authupClient = useAuthupClient();

            const analysis = await coreClient.analysis.getOne(id);

            const options : AttributesPolicy = {
                type: BuiltInPolicyType.ATTRIBUTES,
                query: {
                    endpoint: {
                        $eq: 'http://kong/valid',
                    },
                    requestCount: {
                        $lt: 10,
                    },
                },
            };

            let policy : Policy;
            try {
                policy = await authupClient.policy.getOne(PERMISSION_NAME);
            } catch (e) {
                if (isClientErrorWithStatusCode(e, 404)) {
                    policy = await authupClient.policy.create({
                        name: PERMISSION_NAME,
                        ...options,
                    });
                } else {
                    throw e;
                }
            }

            logger.debug(`Policy ${policy.name} (${policy.id})`);

            await authupClient.policy.update(policy.id, {
                name: PERMISSION_NAME,
                ...options,
            });

            let permission : Permission;
            try {
                permission = await authupClient.permission.getOne(PERMISSION_NAME);
            } catch (e) {
                if (isClientErrorWithStatusCode(e, 404)) {
                    permission = await authupClient.permission.create({
                        name: PERMISSION_NAME,
                    });
                } else {
                    throw e;
                }
            }

            logger.debug(`Permission ${policy.name} (${policy.id})`);

            let analysisPermission : AnalysisPermission;

            const { data: analysisPermissions } = await coreClient.analysisPermission.getMany({
                filter: {
                    analysis_id: analysis.id,
                    permission_id: permission.id,
                },
                page: {
                    limit: 1,
                },
            });

            if (analysisPermissions.length === 0) {
                analysisPermission = await coreClient.analysisPermission.create({
                    policy_id: policy.id,
                    permission_id: permission.id,
                    analysis_id: analysis.id,
                });
            } else {
                [analysisPermission] = analysisPermissions;

                analysisPermission = await coreClient.analysisPermission.update(analysisPermission.id, {
                    policy_id: policy.id,
                    permission_id: permission.id,
                });
            }

            logger.debug(`AnalysisPermission ${analysisPermission.id})`);

            process.exit(0);
        });
}
