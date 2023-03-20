import * as path from 'path';
import { stringToPath } from '@cosmjs/crypto';
import { loadKeys } from '../config';
import CLI from '../CLI';
// @ts-ignore
import { crypto, OKCSecp256k1Wallet } from '@okexchain/javascript-sdk';

export const getSigner = async ({
  network,
  signerId,
  keysPath,
}: {
  network: string;
  signerId: string;
  keysPath: string;
}): Promise<OKCSecp256k1Wallet> => {
  const keys = loadKeys(path.join(process.cwd(), keysPath));

  if (!keys[signerId]) {
    CLI.error(
      `The key corresponding to "${signerId}" does not exist in "${keysPath}".`,
      'Signer Not Found',
    );
  }
  let privateKey = '';
  if (!keys[signerId].mnemonic) {
    privateKey = keys[signerId].privateKey;
  } else {
    // @ts-ignore
    privateKey = crypto.getPrivateKeyFromMnemonic(keys[signerId].mnemonic);
  }
  const signer = OKCSecp256k1Wallet.fromKey(Buffer.from(privateKey, 'hex'), 'ex');
  return signer;
};
