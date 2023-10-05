import { providers, Wallet, ethers } from 'ethers'
import SafeApiKit from '@safe-global/api-kit'
import { getRpcUrl } from '../setup';
import { TX_SERVICE_URL } from '../common/constants';
import Safe, { SafeFactory, EthersAdapter } from '@safe-global/protocol-kit'
import { getChainID } from '../common/utils';

let ethAdapter: EthersAdapter;
let safeService: SafeApiKit;
let provider: providers.JsonRpcProvider;
let wallet: Wallet;
let safeSDK: Record<string, Safe>  = {};
let safeFactory: SafeFactory;

export function getEthAdapter() {
    return ethAdapter;
}

export function setEthAdapter() {
    const safeOwner = getWallet();

    ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: safeOwner as any
    });

    return ethAdapter;
}

export function getProvider(){
    if(provider) return provider;
    provider =  new providers.JsonRpcProvider(getRpcUrl());
    return provider;
}

export function setWallet(pk: any) {
    wallet =  new Wallet(pk, getProvider());
    return wallet;
}

export function getWallet() {
    return wallet;
}

export async function getSafeService() {
    if(safeService) return safeService;

    const txServiceUrl = TX_SERVICE_URL[await getChainID()];
    safeService = new SafeApiKit({ txServiceUrl, ethAdapter: getEthAdapter() });
    return safeService;
}

export async function getSafeSDK(safeAddress: string) {
    if(safeSDK?.[safeAddress]) return safeSDK[safeAddress];
    safeSDK[safeAddress] = await Safe.create({ ethAdapter: getEthAdapter(), safeAddress });

    return safeSDK[safeAddress];

}

export async function getSafeFactory() {
    if(safeFactory) return safeFactory; 
    safeFactory = await SafeFactory.create({ ethAdapter: getEthAdapter() });
    return safeFactory;
}

export function reset() {
    ethAdapter = null as any;
    safeService = null as any;
    provider = null as any;
    wallet = null as any;
    safeSDK = {} as any;
    safeFactory = null as any;
}