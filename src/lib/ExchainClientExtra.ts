import {
  Coin, ExecuteResult, Secp256k1HdWallet, SigningCosmWasmClient,
} from 'cosmwasm';
import { ContractRef } from '../config';

export type ContractRefs = { [contractName: string]: ContractRef };

export class ExchainClientExtra {
  refs: ContractRefs;

  httpEndpoint: string;

  constructor(httpEndpoint: string, refs: ContractRefs) {
    this.refs = refs;
    this.httpEndpoint = httpEndpoint;
  }

  // query(contract: string, msg: Object, instanceId = 'default') {
  //   return this.wasm.contractQuery(
  //     this.refs[contract].contractAddresses[instanceId],
  //     msg,
  //   );
  // }

  async execute(
    contract: string,
    wallet: Secp256k1HdWallet,
    msg: Record<string, any>,
    funds?: Coin[],
    instanceId = 'default',
  ): Promise<ExecuteResult> {
    const cosmwasmClient = await SigningCosmWasmClient.connectWithSigner(this.httpEndpoint, wallet);
    cosmwasmClient.disconnect()
    const account = await wallet.getAccounts();
    const contractAddress = contract.startsWith('ex') ? contract : this.refs[contract].contractAddresses[instanceId];
    const res = await cosmwasmClient.execute(account[0].address, contractAddress, msg, 'auto', 'execute', funds);
    return res;
  }
}
