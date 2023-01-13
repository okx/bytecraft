import { Command, flags } from '@oclif/command';
import * as fs from 'fs';
import { Secp256k1HdWallet } from 'cosmwasm';
import CLI from '../../CLI';
// @ts-ignore
import { crypto, OKCSecp256k1Wallet } from '@okexchain/javascript-sdk';

export default class WalletNew extends Command {
  static description = 'Generate a new wallet to use for signing contracts';

  static flags = {
    outfile: flags.string({
      description: 'absolute path to store the mnemonic key to. If omitted, output to stdout',
    }),
  };

  async run() {
    const { flags } = this.parse(WalletNew);
    this.log('Generating new wallet');

    const mnemonic = await Secp256k1HdWallet.generate(12, { prefix: 'ex' });
    const privateKey = crypto.getPrivateKeyFromMnemonic(mnemonic.mnemonic);
    const wallet = await OKCSecp256k1Wallet.fromKey(Buffer.from(privateKey,'hex'), 'ex');
    if (flags.outfile) {
      if (fs.existsSync(flags.outfile)) {
        this.error(`outfile: '${flags.outfile}' already exists, abort`);
        this.exit(1);
      }

      this.log(`saving mnemonic to '${flags.outfile}'`);
      fs.writeFileSync(flags.outfile, mnemonic.mnemonic);
      this.exit(0);
    }

    this.log('address:');
    const accounts = await wallet.getAccounts();
    this.log(accounts[0].address);
    this.log('mnemonic key:');
    this.log(mnemonic.mnemonic);

    CLI.error(
      'Anyone who gains access to your seed phrase can access the contents of the corresponding wallet. Be cognizant of the fact that there is no recourse for theft of a seed phrase.',
      'Private Key Warning',
    );
  }
}
