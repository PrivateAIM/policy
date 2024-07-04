/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { generateSwagger } from '@privateaim/server-http-kit';
import { useLogger } from '@privateaim/server-kit';
import type { CAC } from 'cac';
import path from 'node:path';
import { configure, useEnv } from '../../config';
import { createHttpServer } from '../../http/server';

export function mountCLIStartCommand(cli: CAC) {
    cli
        .command('start')
        .action(async () => {
            configure();

            const logger = useLogger();

            logger.debug('Generating documentation');
            const cwd = process.cwd();
            await generateSwagger({
                authupURL: useEnv('authupURL'),
                baseURL: useEnv('publicURL'),
                cwd,
                controllerBasePath: path.join(cwd, 'src', 'http', 'controllers'),
            });
            logger.debug('Generated documentation');

            const server = createHttpServer();
            const port = useEnv('port');

            server.listen(port, () => {
                logger.debug(`Listening on port ${port}`);
            });
        });
}
