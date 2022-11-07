import * as path from 'path';
import { Secp256k1HdWallet } from 'cosmwasm';
import { stringToPath } from '@cosmjs/crypto';
import { loadKeys } from '../config';
import CLI from '../CLI';

export const getSigner = async ({
  network,
  signerId,
  keysPath,
}: {
  network: string;
  signerId: string;
  keysPath: string;
}): Promise<Secp256k1HdWallet> => {
  const keys = loadKeys(path.join(process.cwd(), keysPath));

  if (!keys[signerId]) {
    CLI.error(
      `The key corresponding to "${signerId}" does not exist in "${keysPath}".`,
      'Signer Not Found',
    );
  }
  const hdPath = [stringToPath("m/44'/118'/0'/0/0")];

  // @ts-ignore
  return Secp256k1HdWallet.fromMnemonic(keys[signerId].mnemonic, { hdPaths: hdPath, prefix: 'ex' });
};
