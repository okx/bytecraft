import { flags } from '@oclif/command';

export const signer = flags.string({ default: 'test' });

export const noRebuild = flags.boolean({
  description: 'deploy the wasm bytecode as is.',
  default: false,
});

export const instanceId = flags.string({ default: 'default', description: 'enable management of multiple instances of the same contract' });

export const network = flags.string({ default: 'localnet', description: 'network to deploy to from config.json' });

export const configPath = flags.string({ default: './config.json' });

export const refsPath = flags.string({ default: './refs.json' });

export const keysPath = flags.string({ default: './keys.js' });

// These three are commonly used together.
export const cliPaths = {
  'config-path': configPath,
  'refs-path': refsPath,
  'keys-path': keysPath,
};
