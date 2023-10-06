import { providers, Wallet, ethers, Signer } from 'ethers'
import SafeApiKit from '@safe-global/api-kit'
import { getRpcUrl } from '../setup';
import { TX_SERVICE_URL } from '../common/constants';
import Safe, { SafeFactory, EthersAdapter } from '@safe-global/protocol-kit'
import { getChainID } from '../common/utils';

let ethAdapter: EthersAdapter;
let safeService: SafeApiKit;
let provider: providers.JsonRpcProvider;
let _signer: Signer;
let safeSDK: Record<string, Safe>  = {};
let safeFactory: SafeFactory;

export function getEthAdapter() {
    return ethAdapter;
}

export function setEthAdapter() {
    const safeOwner = getSigner();

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

export function setSigner(signer: Signer) {
    signer.connect(getProvider());
    _signer = signer;
    return _signer;
}

export function getSigner() {
    return _signer;
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
    _signer = null as any;
    safeSDK = {} as any;
    safeFactory = null as any;
}