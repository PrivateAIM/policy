/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PolicyType } from '../../constants';

export type CPUPolicyOptions = {
    min: number
};

export type CPUPolicyData = {
    amount: number
};

export type DummyPolicy = CPUPolicyOptions & {
    type: PolicyType.CPU
};
