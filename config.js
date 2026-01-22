import { getApiBaseUrl as fetchUrl } from './utils/remoteConfig';

export const API_BASE_URL = fetchUrl();
export { fetchUrl as getApiBaseUrl };
