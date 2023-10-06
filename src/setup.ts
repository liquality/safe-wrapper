import { Signer } from "ethers";
import { reset, setEthAdapter, setSigner } from "./factory";

let RPC_URL = '';
let GELATO_RELAY_API_KEY = ''
let APP_NAME = '';
let SERVER_ADDRESS = '';

export function getRpcUrl() {
  return RPC_URL;
}

export function getServerAddress() {
  return SERVER_ADDRESS;
}

export function getAppName() {
  return APP_NAME;
}

export function getGelatoRelayApiKey() {
  return GELATO_RELAY_API_KEY;
}

export function setup({signer, rpcUrl, gelatoRelayApiKey, appName, serverAddress} : 
  {signer: Signer, rpcUrl: string, gelatoRelayApiKey: string, appName: string, serverAddress: string}) {
  reset();

  RPC_URL = rpcUrl;
  GELATO_RELAY_API_KEY = gelatoRelayApiKey;
  APP_NAME = appName;
  SERVER_ADDRESS = serverAddress || 'http://localhost:3000';
  setSigner(signer);
  setEthAdapter();
}