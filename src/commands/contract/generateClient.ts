import { Command, flags } from '@oclif/command';
import { cli } from 'cli-ux';
import { join } from 'path';
import { execSync } from 'child_process';
import { pathExistsSync, existsSync, copySync } from 'fs-extra';
import { pascal } from 'case';
import CLI from '../../CLI';
import runCommand from '../../lib/runCommand';
import generateClient from '../../lib/generateClient';

export default class GenerateClient extends Command {
  static description = 'Generate a Chain TypeScript client.';

  static flags = {
    'lib-path': flags.string({ default: 'lib', description: 'location to place the generated client' }),
    'build-schema': flags.boolean({ default: false }),
  };

  static args = [{ name: 'contract', required: true }];

  async run() {
    const { args, flags } = this.parse(GenerateClient);

    // Command execution path.
    const execPath = join('contracts', args.contract);

    // Command to be performed.
    const command = async () => {
      if (flags['build-schema']) {
        cli.action.start('running cargo schema');
        const workingDirectory = process.cwd();
        process.chdir(execPath);
        execSync('cargo schema', { stdio: 'inherit' });

        // Move back to starting point.
        process.chdir(workingDirectory);

        cli.action.stop();
      }

      cli.action.start(
        `Generating ${pascal(args.contract)}Contract.ts`,
      );

      await generateClient(
        pascal(args.contract),
        join(execPath, 'schema'),
        join(flags['lib-path'], 'clients'),
      );

      cli.action.stop();
    };

    // Error check to be performed upon each backtrack iteration.
    const errorCheck = () => {
      if (existsSync('contracts') && !existsSync(execPath)) {
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
