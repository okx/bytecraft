import {
  Coin, ExecuteResult, SigningCosmWasmClient,
} from 'cosmwasm';
import { OfflineAminoSigner } from '@cosmjs/amino/build/signer';
import { ContractRef } from '../config';
import { DefaulrGasPrice } from './key';
import { StdFee } from '@cosmjs/stargate';

export type ContractRefs = { [contractName: string]: ContractRef };

export class ExchainClientExtra {
  refs: ContractRefs;

  httpEndpoint: string;

  constructor(httpEndpoint: string, refs: ContractRefs) {
    this.refs = refs;
    this.httpEndpoint = httpEndpoint;
  }

  async query(contract: string, msg: Record<string, unknown>, instanceId = 'default') {
    const cosmwasmClient = await SigningCosmWasmClient.connect(this.httpEndpoint);
    const contractAddress = contract.startsWith('ex') || contract.startsWith('0x') ? contract : this.refs[contract].contractAddresses[instanceId];
    return cosmwasmClient.queryContractSmart(contractAddress, msg);
  }

  async execute(
    contract: string,
    wallet: OfflineAminoSigner,
    msg: Record<string, any>,
    gasfee: StdFee | 'auto' | number,
    funds?: Coin[],
    instanceId = 'default',
  ): Promise<ExecuteResult> {
    const cosmwasmClient = await SigningCosmWasmClient.connectWithSigner(
      this.httpEndpoint,
      wallet,
      {
        gasPrice: DefaulrGasPrice,
        broadcastTimeoutMs: 60_000,
        broadcastPollIntervalMs: 10_000,
      },
    );
    const account = await wallet.getAccounts();
    const contractAddress = contract.startsWith('ex') || contract.startsWith('0x') ? contract : this.refs[contract].contractAddresses[instanceId];
    const res = await cosmwasmClient.execute(account[0].address, contractAddress, msg, gasfee, 'execute', funds);
    return res;
  }
}
