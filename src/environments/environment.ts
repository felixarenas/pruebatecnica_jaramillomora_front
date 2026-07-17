import packageInfo from '../../package.json';
import { Environment } from './environment.model';

export const environment: Environment = {
    appVersion: packageInfo.version,
    production: true,
    apiUrl: 'http://localhost:3050/api/v1',
    /** GiB para web-ifc MEMORY_LIMIT. Máx. usable ≈ 4 (se acota a uint32). Default lib: 2. */
    maxMemoryRender: 2,
};
