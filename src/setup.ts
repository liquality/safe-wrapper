import { setEthAdapter, setWallet } from "./factory";

let RPC_URL = '';
let GELATO_RELAY_API_KEY = ''

export function getRpcUrl() {
  return RPC_URL;
}

export function getGelatoRelayApiKey() {
  return GELATO_RELAY_API_KEY;
}

export function setup(config: {pk: string, rpcUrl: string, gelatoRelayApiKey: string}) {
  RPC_URL = config.rpcUrl;
  GELATO_RELAY_API_KEY = config.gelatoRelayApiKey;
  setWallet(config.pk);
  setEthAdapter();
}