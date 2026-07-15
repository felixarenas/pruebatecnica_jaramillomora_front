import packageInfo from '../../package.json';
import { Environment } from './environment.model';

export const environment: Environment = {
    appVersion: packageInfo.version,
    production: true,
    apiUrl: 'http://localhost:3050/api/v1',
};
