import config from "../config.json";
export function getApiUrl() {
  switch (process.env.REACT_APP_NODE_ENV) {
    case "development":
      return config.api_url_dev;
    case "production":
      return config.api_url_prod;
  }
}
