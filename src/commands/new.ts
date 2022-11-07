import { Command, flags } from '@oclif/command';
import { TemplateScaffolding } from '@terra-money/template-scaffolding';
import cli from 'cli-ux';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { pascal } from 'case';

export default class New extends Command {
  static description = 'Create new dapp from template.';

  static examples = [
    '$ wasmknife new awesome-dapp',
    '$ wasmknife new awesome-dapp --path path/to/dapp',
    '$ wasmknife new awesome-dapp --path path/to/dapp --authors "ExampleAuthor<example@email.domain>"',
  ];

  static flags = {
    path: flags.string({
      description: 'Path to create the workspace',
      default: '.',
    }),
    version: flags.string({
      default: '1.0',
    }),
    authors: flags.string({
      default: 'OKC <okc@okg.com>',
    }),
  };

  static args = [{ name: 'name', required: true }];

  async run() {
    const { args, flags } = this.parse(New);

    const appDir = path.join(process.cwd(), flags.path, args.name);
    const contractDir = path.join(appDir, 'contracts', args.name);

    if (fs.existsSync(appDir)) {
      throw Error(`Folder '${args.name}' already exists under path '${flags.path}'.\nTip: Use another path or project name`);
    }

    const templateEntries = {
      'project-name': args.name,
      'contract-name': `${pascal(args.name)}Contract`,
      'client-name': `${pascal(args.name)}Client`,
      // Crates cannot have dashes, and Rust will map underscores to dashes for us.
      crate_name: args.name.replaceAll('-', '_'),
      authors: flags.authors,
      ' "now" | date: "%Y" ': `${new Date().getFullYear()}`,
    };

    cli.log(`generating app ${args.name}:`);
    cli.action.start('- workspace');
    await TemplateScaffolding.from({
      remoteUrl: 'https://codeload.github.com/okex/wasmknife-core-template/zip/refs/heads/main',
      subFolder: 'wasmknife-core-template-main',
      localOptions: {
        folderUrl: appDir,
      },
      replace: {
        entries: templateEntries,
      },
    });
    cli.action.stop();

    cli.action.start('- contract');
    await TemplateScaffolding.from({
      remoteUrl: `https://codeload.github.com/InterWasm/cw-template/zip/refs/heads/${flags.version}`,
      subFolder: `cw-template-${flags.version}`,
      localOptions: {
        folderUrl: contractDir,
      },
      replace: {
        entries: templateEntries,
      },
    });
    cli.action.stop();
    // Install app dependencies.
    process.chdir(appDir);
    cli.action.start('- installing app dependencies');
    await execSync('npm i --silent', { stdio: 'inherit' });
    cli.action.stop();
  }
}
