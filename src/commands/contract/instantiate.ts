import { Command, flags } from '@oclif/command';
import { join } from 'path';
import { existsSync } from 'fs';
import { loadConfig, loadConnections } from '../../config';
import { instantiate } from '../../lib/deployment';
import { getSigner } from '../../lib/signer';
import * as flag from '../../lib/flag';
import CLI from '../../CLI';
import runCommand from '../../lib/runCommand';

export default class ContractInstantiate extends Command {
  static description = 'Instantiate the contract.';

  static flags = {
    signer: flag.signer,
    network: flag.network,
    'instance-id': flags.string({ default: 'default' }),
    'code-id': flags.integer({
      description:
        'specific codeId to instantiate',
    }),
    'admin-address': flags.string({
      description: 'set custom address as contract admin to allow migration.',
      default:'',
    }),
    ...flag.cliPaths,
  };

  static args = [{ name: 'contract', required: true }];

  async run() {
    const { args, flags } = this.parse(ContractInstantiate);

    // Command execution path.
    const execPath = flags['config-path'];

    // Command to be performed.
    const command = async () => {
      const connections = loadConnections(flags['config-path']);
      const config = loadConfig(flags['config-path']);
      const conf = config(flags.network, args.contract);
      const httpEndpoint = connections(flags.network);
      const signer = await getSigner({
        network: flags.network,
        signerId: flags.signer,
        keysPath: flags['keys-path'],
      });

      const accounts = await signer.getAccounts();
      const admin = flags['admin-address'];

      await instantiate({
        conf,
        signer,
        admin,
        contract: args.contract,
        codeId: flags['code-id'],
        network: flags.network,
        label: args.contract,
        instanceId: flags['instance-id'],
        refsPath: flags['refs-path'],
        httpEndpoint: httpEndpoint.URL,
      });
    };

    // Error check to be performed upon each backtrack iteration.
    const errorCheck = () => {
      if (existsSync('contracts') && !existsSync(join('contracts', args.contract))) {
        CLI.error(
          `Contract "${args.contract}" not available in "contracts/" directory.`,
          'Contract Unavailable',
        );
      }
    };

    // Attempt to execute command while backtracking through file tree.
    await runCommand(
      execPath,
      command,
      errorCheck,
    );
  }
}
