import * as path from 'path';
import { stringToPath } from '@cosmjs/crypto';
import { loadKeys } from '../config';
import CLI from '../CLI';
// @ts-ignore
// import { crypto, OKCSecp256k1Wallet } from '@okexchain/javascript-sdk';
import { OKSecp256k1HdWallet} from '../signer/OKSecp256k1Wallet';

export const getSigner = async ({
  network,
  signerId,
  keysPath,
}: {
  network: string;
  signerId: string;
  keysPath: string;
}): Promise<OKSecp256k1HdWallet> => {
  const keys = loadKeys(path.join(process.cwd(), keysPath));

  if (!keys[signerId]) {
    CLI.error(
      `The key corresponding to "${signerId}" does not exist in "${keysPath}".`,
      'Signer Not Found',
    );
  }
  // let privateKey = '';
  if (!keys[signerId].mnemonic) {
    // const privateKey = keys[signerId].privateKey;
    return OKSecp256k1HdWallet.fromKey(keys[signerId].privateKey);
  } else {
    // @ts-ignore
    // privateKey = crypto.getPrivateKeyFromMnemonic(keys[signerId].mnemonic);
    return OKSecp256k1HdWallet.fromMnemonic(keys[signerId].mnemonic);
  }
  // const signer = OKSecp256k1HdWallet.fromKey(privateKey);
  // return signer;
};
