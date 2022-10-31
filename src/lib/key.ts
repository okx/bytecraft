import { GasPrice } from "cosmwasm";
import { OfflineAminoSigner } from "@cosmjs/amino/build/signer";

export const DefaulrGasPrice = GasPrice.fromString("200000000wei");

export class Key {
  /**
   * Space-separated mnemonic phrase.
   */
  mnemonic: string;

  privateKey: string;

  constructor(mnemonic: string, privateKey: string) {
    this.mnemonic = mnemonic;
    this.privateKey = privateKey;
  }
}

export class Wallet {
  constructor(public wallet: OfflineAminoSigner) {}
}

