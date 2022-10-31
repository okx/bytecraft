import { Command, flags } from '@oclif/command';
import * as YAML from 'yaml';
import { cli } from 'cli-ux';
import { existsSync } from 'fs';
import { SigningCosmWasmClient } from 'cosmwasm';
import { loadConnections, loadRefs } from '../../config';
import { getSigner } from '../../lib/signer';
import * as flag from '../../lib/flag';
import TerrainCLI from '../../TerrainCLI';
import runCommand from '../../lib/runCommand';
import { DefaulrGasPrice } from '../../lib/key';

export default class ContractUpdateAdmin extends Command {
  static description = 'Update the admin of a contract.';

  static flags = {
    signer: flag.signer,
    network: flag.network,
    'config-path': flags.string({ default: 'config.terrain.json' }),
    'refs-path': flags.string({ default: 'refs.terrain.json' }),
    'keys-path': flags.string({ default: 'keys.terrain.js' }),
    'instance-id': flags.string({ default: 'default' }),
  };

  static args = [
    { name: 'contract', required: true },
    { name: 'admin', required: true },
  ];

  async run() {
    const { args, flags } = this.parse(ContractUpdateAdmin);

    // Command execution path.
    const execPath = flags['config-path'];

    // Command to be performed.
    const command = async () => {
      const connections = loadConnections(flags['config-path']);
      const refs = loadRefs(flags['refs-path']);
      const { network } = flags;
      const httpEndpoint = connections(flags.network);
      const signer = await getSigner({
        network: flags.network,
        signerId: flags.signer,
        keysPath: flags['keys-path'],
      });

      const contractAddress = refs[network][args.contract].contractAddresses[flags['instance-id']];

      cli.action.start(
        `Updating contract admin to: ${args.admin}`,
      );

      // const updateAdminTx = await signer.createAndSignTx({
      //   msgs: [
      //     new MsgUpdateContractAdmin(
      //       signer.key.accAddress,
      //       args.admin,
      //       contractAddress,
      //     ),
      //   ],
      // });

      // const res = await lcd.tx.broadcast(updateAdminTx);

      const cosmwasmClient = await SigningCosmWasmClient.connectWithSigner(httpEndpoint.URL, signer, { gasPrice: DefaulrGasPrice});
      const account = await signer.getAccounts();
      const res = await cosmwasmClient.updateAdmin(account[0].address, contractAddress, args.admin, 'auto', 'update admin');

      cli.action.stop();

      if (res) {
        cli.log(YAML.stringify(res));
      } else {
        cli.error('Transaction not included in block before timeout.');
      }
    };

    // Error check to be performed upon each backtrack iteration.
    const errorCheck = () => {
      if (existsSync('contracts') && !existsSync(execPath)) {
        TerrainCLI.error(
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
