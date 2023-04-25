// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineAminoSigner } from '@cosmjs/amino/build/signer';
// @ts-ignore
import { crypto } from '@okexchain/javascript-sdk';
import { Buffer } from 'buffer';
import {
  AccountData, AminoSignResponse, encodeSecp256k1Signature, StdSignDoc,
} from 'cosmwasm';
import * as web3 from 'web3';
// eslint-disable-next-line import/no-extraneous-dependencies
import { serializeSignDoc } from '@cosmjs/amino';
import { Secp256k1 } from '@cosmjs/crypto';

export class OKSecp256k1HdWallet implements OfflineAminoSigner {
  private readonly privateKey: string;

  private readonly pubKey: Uint8Array;

  private readonly bech32Address: string;

  private readonly hexAddress: string;

  /**
   * Restores a wallet from the given BIP39 mnemonic.
   *
   * @param mnemonic Any valid English mnemonic.
   */
  public static async fromMnemonic(
    mnemonic: string,
  ): Promise<OKSecp256k1HdWallet> {
    const privateKey = crypto.getPrivateKeyFromMnemonic(mnemonic);
    return new OKSecp256k1HdWallet(privateKey);
  }

  static async fromKey(privkey: string) {
    return new OKSecp256k1HdWallet(privkey);
  }

  protected constructor(privateKey: string) {
    this.privateKey = privateKey;
    const pk = crypto.encodePubKeyToCompressedBuffer(crypto.getPubKeyFromPrivateKey(privateKey));
    this.pubKey = pk;
    this.bech32Address = crypto.getAddressFromPrivateKey(privateKey).toString('hex');
    this.hexAddress = crypto.convertBech32ToHex(this.bech32Address)[0];
  }

  public async getAccounts(): Promise<readonly AccountData[]> {
    return [{
      algo: 'secp256k1',
      address: this.hexAddress,
      pubkey: this.pubKey,
    }];
  }

  public async getHexAddress(): Promise<string> {
    return this.hexAddress;
  }

  public async getBech32Address(): Promise<string> {
    return this.bech32Address;
  }

  public async signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse> {
    // @ts-ignore
    const message = web3.default.utils.sha3(Buffer.from((0, serializeSignDoc)(signDoc)));
    // @ts-ignore
    const signature = await Secp256k1.createSignature(Uint8Array.from(Buffer.from(message.substring(2), 'hex')), this.privateKey);
    const signatureBytes = new Uint8Array([...signature.r(32), ...signature.s(32)]);
    return {
      signed: signDoc,
      signature: encodeSecp256k1Signature(this.pubKey, signatureBytes),
    };
  }
}
