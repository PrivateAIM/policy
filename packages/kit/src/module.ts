/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PolicyEngine as BasePolicyEngine } from '@authup/kit';
import { PolicyType } from './constants';
import { CPUPolicyEvaluator } from './evaluators';

export class PolicyEngine extends BasePolicyEngine {
    constructor() {
        super();

        this.registerEvaluator(PolicyType.CPU, new CPUPolicyEvaluator());
    }
}
