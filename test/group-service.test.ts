import {describe, expect, test} from '@jest/globals';
import {setup, GroupService, TransactionService} from '../src'
import * as dotenv from 'dotenv';
dotenv.config();

/** 
 * Test creating a group with 1 member
 * Add one more member and change threshold to 2
 * Add two more members to the group
 * Change threshold to 2
 */
describe('Group Service', () => {
  const timeout = 60000;
  let safeAddress;
  const setupConfig = {pk: process.env.PRIVATE_KEY1!, rpcUrl: process.env.RPC_URL!, gelatoRelayApiKey: process.env.GELATO_RELAY_API_KEY!, appName: process.env.APP_NAME!};
  const member1 = {address: process.env.OWNER1!, key: process.env.PRIVATE_KEY1!};
  const member2 = {address: process.env.OWNER2!, key: process.env.PRIVATE_KEY2!};
  const member3 = {address: process.env.OWNER3!, key: process.env.PRIVATE_KEY3!};
  const member4 = {address: process.env.OWNER4!, key: process.env.PRIVATE_KEY4!};

  test('should create a group', async () => {
    setup(setupConfig);
    safeAddress =  await GroupService.createGroup([member1.address], 1);
    console.log('safeAddress => ', safeAddress);
    expect(safeAddress).toBeTruthy();
    
    // Get group info
    const groupInfo = await GroupService.getGroupInfo(safeAddress);
    expect(groupInfo.owners.includes[member1.address]).toBe(true);
    expect(groupInfo.owners.length).toBe(1);
    expect(groupInfo.threshold).toBe(1);
  }, timeout);

  test('should add a group member and change minApprovals to 2', async () => {
    const txHash =  await GroupService.addMember(safeAddress, member2.address, 2);
    console.log(" txHash => ", txHash);
    expect(txHash).toBeTruthy();

    // Get group info
    const groupInfo = await GroupService.getGroupInfo(safeAddress);
    expect(groupInfo.owners.includes[member2.address]).toBe(true);
    expect(groupInfo.owners.length).toBe(2);
    expect(groupInfo.threshold).toBe(2);
  }, timeout);

  test('should fail if minApprovals not met', async () => {
    const {safeTxHash} =  await GroupService.addMembers(safeAddress, [member3.address, member4.address]);
    const safeTransaction = await TransactionService.getTransactionBySafeTxHash(safeTxHash!);

    expect(async () => {await TransactionService.executeTransaction(safeAddress, safeTransaction)}).rejects.toThrow();
  }, timeout);

  test('should batch add two group members', async () => {
    const {safeTxHash} =  await GroupService.addMembers(safeAddress, [member3.address, member4.address]);

    // Add another approval and auto execute
    setup({...setupConfig,  pk: member2.key});
    const txHash = await TransactionService.voteTransaction(safeAddress, safeTxHash!);
    console.log('txHash => ', txHash);

    expect(txHash).toBeTruthy();

    // Get group info
    const groupInfo = await GroupService.getGroupInfo(safeAddress);
    expect(groupInfo.owners.includes[member3.address]).toBe(true);
    expect(groupInfo.owners.includes[member4.address]).toBe(true);
    expect(groupInfo.owners.length).toBe(4);
    expect(groupInfo.threshold).toBe(2);

  }, timeout);

  test('should change min approvals', async () => {
    setup({...setupConfig,  pk: member1.key});

    const {safeTxHash} =  await GroupService.changeMinApprovals(safeAddress, 3);

    // Add another approval and auto execute
    setup({...setupConfig,  pk: member2.key});
    const signatureOrHash = await TransactionService.voteTransaction(safeAddress, safeTxHash!);
    console.log('Signature => ', signatureOrHash);

    expect(signatureOrHash).toBeTruthy();

    // Get group info
    const groupInfo = await GroupService.getGroupInfo(safeAddress);
    expect(groupInfo.threshold).toBe(3);

  }, timeout);
});