import { Command } from '@oclif/command';
import { join } from 'path';
import { existsSync } from 'fs';
import { build, check } from '../../lib/deployment';
import * as flag from '../../lib/flag';
import CLI from '../../CLI';
import runCommand from '../../lib/runCommand';

export default class Build extends Command {
  static description = 'Build wasm bytecode.';

  static flags = {
    'config-path': flag.configPath,
  };

  static args = [{
    name: 'contract',
    required: true,
  }];

  async run() {
    const { args } = this.parse(Build);

    // Command execution path.
    const execPath = join('contracts', args.contract);

    // Command to be performed.
    const command = async () => {
      await build({
        contract: args.contract,
      });
      await check({ contract: args.contract });
    };

    // Error check to be performed upon each backtrack iteration.
    const errorCheck = () => {
      if (existsSync('contracts') && !existsSync(execPath)) {
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
