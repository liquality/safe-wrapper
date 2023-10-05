import { reset, setEthAdapter, setWallet } from "./factory";

let RPC_URL = '';
let GELATO_RELAY_API_KEY = ''
let APP_NAME = '';

export function getRpcUrl() {
  return RPC_URL;
}

export function getAppName() {
  return APP_NAME;
}

export function getGelatoRelayApiKey() {
  return GELATO_RELAY_API_KEY;
}

export function setup(config: {pk: string, rpcUrl: string, gelatoRelayApiKey: string, appName: string}) {
  reset();
  RPC_URL = config.rpcUrl;
  GELATO_RELAY_API_KEY = config.gelatoRelayApiKey;
  APP_NAME = config.appName;
  setWallet(config.pk);
  setEthAdapter();
}