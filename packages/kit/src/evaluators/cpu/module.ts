/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { cpus } from 'node:os';
import type { PolicyEvaluator, PolicyEvaluatorContext } from '@authup/kit';
import { PolicyType } from '../../constants';
import type { CPUPolicyData, CPUPolicyOptions } from './types';

export class CPUPolicyEvaluator implements PolicyEvaluator {
    canEvaluate(ctx: PolicyEvaluatorContext<any, any>): ctx is PolicyEvaluatorContext<CPUPolicyOptions, CPUPolicyData> {
        // todo: validate ctx.options
        return ctx.options.type === PolicyType.CPU;
    }

    evaluate(ctx: PolicyEvaluatorContext<CPUPolicyOptions, CPUPolicyData>) : boolean {
        let amount : number;
        if (
            ctx.data &&
            typeof ctx.data.amount === 'number'
        ) {
            amount = ctx.data.amount;
        } else {
            amount = cpus().length;
        }

        return ctx.options.min <= amount;
    }
}
