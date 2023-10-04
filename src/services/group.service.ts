import { SafeAccountConfig } from "@safe-global/protocol-kit";
import { getSafeFactory, getSafeSDK, getSafeService } from "../factory";
import { MetaTransactionData, OperationType, SafeTransactionData, SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types';
import { TransactionService } from "./transaction.service";

export abstract class GroupService {

  public static async createGroup(addresses: string[], minApprovals: number) {
    const safeFactory = await getSafeFactory();
    const safeAccountConfig: SafeAccountConfig = {
      owners: addresses,
      threshold: minApprovals
    }
    const safeSDk = await safeFactory.deploySafe({safeAccountConfig});

    return safeSDk.getAddress();
  }

  public static async addMember(safeAddress: string, address: string, minApprovals?: number) {
    const safeSDK = await getSafeSDK(safeAddress);
    
    const safeTx = await safeSDK.createAddOwnerTx({ownerAddress: address, threshold: minApprovals});
    
    await TransactionService.proposeTransaction(safeAddress, safeTx);
        
  }

  public static async addMembers(safeAddress: string, addresses: string[], minApprovals?: number) {
    const safeSDK = await getSafeSDK(safeAddress);
    const txs: MetaTransactionData[] = [];
    let eachSafeTx;
    for(let i = 0; i < addresses.length; i++){
      eachSafeTx = await safeSDK.createAddOwnerTx({ownerAddress: addresses[i]})
      txs.push({data: eachSafeTx.data.data, to: eachSafeTx.data.to, value: eachSafeTx.data.value});
    }

    if(minApprovals) {
      eachSafeTx = await safeSDK.createChangeThresholdTx(minApprovals)

      txs.push({data: eachSafeTx.data.data, to: eachSafeTx.data.to, value: eachSafeTx.data.value});
    }

    const tx =  await safeSDK.createTransactionBatch(txs);
    const safeTransactionData: SafeTransactionDataPartial = {data: tx.data, to: safeSDK.getMultiSendCallOnlyAddress(), value: '0', operation: OperationType.DelegateCall};
    const finalSafeTx = await safeSDK.createTransaction({safeTransactionData});
    
    await TransactionService.proposeTransaction(safeAddress, finalSafeTx);
        
  }

  public static async getMyGroups(address: string) {
    const safeService = await getSafeService();
    return await safeService.getSafesByOwner(address);
  }

  public static async getGroupInfo(address: string) {
    const safeService = await getSafeService();
    return await safeService.getSafeInfo(address);
  }
}