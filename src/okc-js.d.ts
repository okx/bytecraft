// import { StdSignDoc, AccountData, AminoSignResponse, OfflineAminoSigner } from '@cosmjs/amino';
declare module '@okexchain/javascript-sdk';
// declare module ' @okexchain/javascript-sdk ';
export const getPrivateKeyFromMnemonic: (mnemonic: string, coinType: string) => string;
export const getAddressFromPubKey: (publicKey: string, prefix: string) => string;
export const encodePubKeyToCompressedBuffer: (pubKey) => Buffer;

export class OKCSecp256k1Wallet implements OfflineAminoSigner {
  /**
   * Creates a Secp256k1Wallet from the given private key
   *
   * @param privkey The private key.
   * @param prefix The bech32 address prefix (human readable part). Defaults to "cosmos".
   */
  static fromKey(privkey: Uint8Array, prefix?: string): Promise<OKCSecp256k1Wallet>;

  private readonly pubkey;

  private readonly privkey;

  private readonly prefix;

  private constructor();

  private get address();

  getAccounts(): Promise<readonly AccountData[]>;

  signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse>;
}
