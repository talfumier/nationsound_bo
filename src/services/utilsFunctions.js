import {environment} from "../environment/environment.js";
export function getApiUrl() {
  return environment.production
    ? environment.api_url_prod
    : environment.api_url_dev;
}
