import { RelayTransaction, SafeMultisigTransactionResponse, SafeTransaction } from '@safe-global/safe-core-sdk-types';
import { getSafeSDK, getSafeService } from '../factory';
import { fetchGet, getChainID, getSafeOwnerAddress, withInterval } from '../common/utils';
import { APP_NAME } from '../common/constants';
import { GelatoRelayPack } from '@safe-global/relay-kit'
import { getSafeContract } from '@safe-global/protocol-kit'
import { getGelatoRelayApiKey } from '../setup';

export abstract class TransactionService {

  /**
   * 
   * @param safeAddress 
   * @param tx 
   * @returns {txHash} for transaction requiring no further approval or {safeTxHash} for transactions requiring more approvals
   */
  public static async proposeTransaction(safeAddress: string, tx: SafeTransaction ) {
    const safeSDK = await getSafeSDK(safeAddress);

    if(await safeSDK.getThreshold() == 1) {
      const txHash =  await TransactionService.executeTransaction(safeAddress, tx);
      return {txHash}
    } 

    const safeService = await getSafeService();
    const safeTxHash = await safeSDK.getTransactionHash(tx);
    const senderSignature = await safeSDK.signTransactionHash(safeTxHash);
    await safeService.proposeTransaction({
      safeAddress,
      safeTransactionData: tx.data,
      safeTxHash,
      senderAddress:getSafeOwnerAddress(),
      senderSignature: senderSignature.data,
      origin: APP_NAME,
    })

    return {safeTxHash};

  }

  public static async getPendingTransactions(safeAddress: string){ 
    const safeService = await getSafeService();

    const pendingTxs = await safeService.getPendingTransactions(safeAddress)

    return pendingTxs;
  }

  public static async getTransactionBySafeTxHash(safeTxHash: string){ 
    const safeService = await getSafeService();

    const tx = await safeService.getTransaction(safeTxHash)

    return tx;
  }

  /**
   * 
   * @param safeAddress 
   * @param safeTxHash 
   * @returns signature or txHash (if this vote satisfies the threshold)
   */
  public static async voteTransaction(safeAddress: string, safeTxHash: string) {

    const safeSDK = await getSafeSDK(safeAddress);
    let safeSignature = await safeSDK.signTransactionHash(safeTxHash);

    const safeService = await getSafeService();
    const signature =  safeService.confirmTransaction(safeTxHash, safeSignature.data);
    const safeTransaction = await this.getTransactionBySafeTxHash(safeTxHash);

    const {confirmationsRequired, confirmations} = safeTransaction;
    if(confirmationsRequired <= confirmations!?.length) return await this.executeTransaction(safeAddress, safeTransaction);

    return signature;

  }

  public static async executeTransaction(safeAddress: string, safeTransaction: SafeMultisigTransactionResponse| SafeTransaction): Promise<string> {
    const safeSDK = await getSafeSDK(safeAddress);

    const isValidTx = await safeSDK.isValidTransaction(safeTransaction);
    if(!isValidTx) throw new Error("Invalid Transaction");

    const relayKit = new GelatoRelayPack(getGelatoRelayApiKey());


    // Prepare the transaction
    const signedSafeTx = await safeSDK.signTransaction(safeTransaction)
    const safeSingletonContract = await getSafeContract({
      ethAdapter: safeSDK.getEthAdapter(),
      safeVersion: await safeSDK.getContractVersion()
    })
    ​
    const encodedTx = safeSingletonContract.encode('execTransaction', [
      signedSafeTx.data.to,
      signedSafeTx.data.value,
      signedSafeTx.data.data,
      signedSafeTx.data.operation,
      signedSafeTx.data.safeTxGas,
      signedSafeTx.data.baseGas,
      signedSafeTx.data.gasPrice,
      signedSafeTx.data.gasToken,
      signedSafeTx.data.refundReceiver,
      signedSafeTx.encodedSignatures()
    ])

    // Send Transaction to relay
    const relayTransaction: RelayTransaction = {
      target: safeAddress,
      encodedTransaction: encodedTx,
      chainId: await getChainID()
    }

    const response = await relayKit.relayTransaction(relayTransaction);
    const taskID = response.taskId;
    console.log('Task id => ', taskID);
    // Check at intervals until transaction is successful
    const hash = await withInterval( async () => {
      const response = await fetchGet(`https://relay.gelato.digital/tasks/status/${taskID}`);
      const task = response.task;
      const badStates = ["Cancelled", "ExecReverted", "Blacklisted"];
      if(task?.taskState === "CheckPending" || task?.taskState === "ExecPending" ||  response.message === "Status not found") {        
        return null;
      }
      else if(badStates.includes(task.taskState)) {
        return new Error("Gasless transaction Failed");
      }else{
        return task.transactionHash
      }
    })    

    return hash;
  }


  public static async hasVoted(address: string, safeTxHash: string, safeAddress: string){
    const {confirmations} = await this.getTransactionBySafeTxHash(safeTxHash);
    if(!confirmations) return false;

    const confirmation = confirmations!.find(
      (confirmation) => confirmation.owner === address
    )
    return !!confirmation

  }
}
