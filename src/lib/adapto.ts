import { AdaptoSDK } from "adapto-client-sdk";
import { API_URL, API_KEY, IS_DEV } from "../config";

export const adapto = new AdaptoSDK({
  baseUrl: API_URL,
  apiKey: API_KEY,
  cache: true,
  debug: IS_DEV,
});
