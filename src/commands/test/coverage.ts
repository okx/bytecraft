import { Command, flags } from '@oclif/command';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export default class Test extends Command {
  static description = 'Runs unit tests for a contract directory.';

  static examples = [
    '$ bytecraft test:coverage',
    '$ bytecraft test:coverage counter',
  ];

  static flags = { };

  static args = [{ name: 'contract-name' }];

  async run() {
    const { args, flags } = this.parse(Test);
    const contractName = args['contract-name'];

    if (contractName) {
      process.chdir(path.join('contracts', contractName));
    }

    const exists = fs.existsSync('./Cargo.toml');
    if (!exists) {
      throw Error(`Folder '${process.cwd()}' does not contain a smart contract.\nTip: Use another path or contract name`);
    }

    execSync(`docker run -e CARGO_HTTP_MULTIPLEXING=false --security-opt seccomp=unconfined -v "${process.cwd()}:/volume" okexchain/tarpaulin`, { stdio: 'inherit' });
  }
}
