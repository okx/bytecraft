import { Command, flags } from '@oclif/command';
import { join } from 'path';
import { existsSync } from 'fs';
import { loadConfig, loadConnections, loadGlobalConfig } from '../config';
import { instantiate, storeCode } from '../lib/deployment';
import { getSigner } from '../lib/signer';
import * as flag from '../lib/flag';
import CLI from '../CLI';
import runCommand from '../lib/runCommand';

export default class Deploy extends Command {
  static description = 'Build wasm bytecode, store code on chain and instantiate.';

  static flags = {
    signer: flag.signer,
    network: flag.network,
    'no-rebuild': flag.noRebuild,
    'instance-id': flag.instanceId,
    'admin-address': flags.string({
      description: 'set custom address as contract admin to allow migration.',
      default:'',
    }),
    ...flag.cliPaths,
  };

  static args = [{ name: 'contract', required: true }];

  async run() {
    const { args, flags } = this.parse(Deploy);

    // Command execution path.
    const execPath = 'config.json';

    // Command to be performed.
    const command = async () => {
      const connections = loadConnections(flags['config-path']);
      const config = loadConfig(flags['config-path']);
      const globalConfig = loadGlobalConfig(flags['config-path']);
      const conf = config(flags.network, args.contract);

      const httpEndpoint = connections(flags.network);
      const signer = await getSigner({
        network: flags.network,
        signerId: flags.signer,
        keysPath: flags['keys-path'],
      });
      if (conf.deployTask) {
        await this.config.runCommand('task:run', [
          conf.deployTask,
          '--signer',
          flags.signer,
          '--network',
          flags.network,
          '--refs-path',
          flags['refs-path'],
          '--config-path',
          flags['config-path'],
          '--keys-path',
          flags['keys-path'],
        ]);
      } else {
        const codeId = await storeCode({
          httpEndpoint: httpEndpoint.URL,
          conf,
          signer,
          noRebuild: flags['no-rebuild'],
          contract: args.contract,
          network: flags.network,
          refsPath: flags['refs-path'],
          useCargoWorkspace: globalConfig.useCargoWorkspace,
        });


        // pause for account sequence to update.
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((r) => setTimeout(r, 1000));
        // const accounts = await signer.getAccounts();
        const admin = flags['admin-address'];
        // ? flags['admin-address']
        // : accounts[0].address;
        await instantiate({
          conf,
          signer,
          admin,
          contract: args.contract,
          codeId,
          network: flags.network,
          instanceId: flags['instance-id'],
          refsPath: flags['refs-path'],
          label: args.contract,
          httpEndpoint: httpEndpoint.URL,
        });
      }

      await this.config.runCommand('contract:generateClient', [
        args.contract,
        '--build-schema',
      ]);
    };

    // Error check to be performed upon each backtrack iteration.
    const errorCheck = () => {
      if (existsSync('contracts') && !existsSync(join('contracts', args.contract))) {
        CLI.error(
          `Contract '${args.contract}' not available in 'contracts/' directory.`,
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
