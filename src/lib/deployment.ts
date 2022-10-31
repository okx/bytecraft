/* eslint-disable no-await-in-loop */
import Os from 'os';
import { parse } from 'toml';
import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import { cli } from 'cli-ux';
import * as YAML from 'yaml';
import dedent from 'dedent';
import path from 'path';
import {
  SigningCosmWasmClient, Secp256k1HdWallet, coin, parseCoins, GasPrice,
} from 'cosmwasm';
import { OfflineAminoSigner } from '@cosmjs/amino/build/signer';
import {
  ContractConfig,
  loadRefs,
  saveRefs,
  setCodeId,
  setContractAddress,
} from '../config';
import TerrainCLI from '../TerrainCLI';
import useARM64 from './useARM64';
import { DefaulrGasPrice } from './key';

type BuildParams = {
  contract: string;
};

export const build = async ({ contract }: BuildParams) => {
  const startingDirectory = process.cwd();
  const folder = path.join('contracts', contract);
  process.chdir(folder);

  const { package: pkg } = parse(fs.readFileSync('./Cargo.toml', 'utf-8'));
  if (contract !== pkg.name) {
    cli.error(`Change the package name in Cargo.toml to ${contract} to build`);
  }

  execSync('cargo wasm', { stdio: 'inherit' });
  process.chdir(startingDirectory);
};

const execDockerOptimization = (image: string, cache: string) => {
  const dir = Os.platform() === 'win32' ? '%cd%' : '$(pwd)';

  execSync(
    `docker run --rm -v "${dir}":/code \
      --mount type=volume,source="${cache}_cache",target=/code/target \
      --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
      ${image}`,
    { stdio: 'inherit' },
  );
};

type OptimizeContractParams = {
  contract: string;
  arm64: boolean | undefined;
};

const optimizeContract = async ({
  contract,
  arm64,
}: OptimizeContractParams) => {
  const startingDirectory = process.cwd();
  const folder = path.join('contracts', contract);
  process.chdir(folder);

  const image = `cosmwasm/rust-optimizer${arm64 ? '-arm64' : ''}:0.12.6`;

  execDockerOptimization(image, contract);

  process.chdir(startingDirectory);
};

const optimizeWorkspace = async ({
  contract,
  arm64,
}: OptimizeContractParams) => {
  const image = `cosmwasm/workspace-optimizer${arm64 ? '-arm64' : ''}:0.12.6`;
  execDockerOptimization(image, contract);
};

type OptimizeParams = {
  contract: string;
  useCargoWorkspace?: boolean,
  network?: string,
};

export const optimize = async ({
  contract,
  useCargoWorkspace,
  network,
}: OptimizeParams) => {
  const arm64 = useARM64(network);
  if (useCargoWorkspace) {
    optimizeWorkspace({
      contract,
      arm64,
    });
  } else {
    optimizeContract({
      contract,
      arm64,
    });
  }
};

type StoreCodeParams = {
  conf: ContractConfig;
  network: string;
  refsPath: string;
  httpEndpoint: string;
  contract: string;
  noRebuild?: boolean;
  signer: OfflineAminoSigner;
  codeId?: number;
  useCargoWorkspace?: boolean,
};

export const storeCode = async ({
  contract,
  signer,
  network,
  refsPath,
  httpEndpoint,
  codeId,
  noRebuild,
  useCargoWorkspace,
}: StoreCodeParams) => {
  const arm64 = useARM64(network);

  if (!noRebuild) {
    await build({ contract });
    await optimize({
      contract,
      useCargoWorkspace,
      network,
    });
  }

  let wasmByteCodeFilename = `${contract.replace(/-/g, '_')}`;

  // rust-optimizer-arm64 produces a file with the `-aarch64` suffix.
  if (arm64) {
    wasmByteCodeFilename += '-aarch64';
  }

  wasmByteCodeFilename += '.wasm';

  // Create boolean to check if user is attempting to store ARM64 wasm binary on mainnet.
  const wasmFiles = fs.readdirSync(path.join('contracts', contract, 'artifacts'));
  const storingARM64Mainnet = (
    !wasmFiles.includes(wasmByteCodeFilename)
    && process.arch === 'arm64'
    && network === 'mainnet'
  );

  // Check if user is attempting to store ARM64 wasm binary on mainnet.
  // If so, reoptimize to default wasm binary to store on mainnet.
  if (storingARM64Mainnet) {
    TerrainCLI.error(dedent`
ARM64 wasm files should not be stored on mainnet. Rebuilding contract to deploy default wasm binary.
    `, 'ARM64 Wasm Detected');

    await optimize({
      contract,
      useCargoWorkspace,
      network,
    });
  }

  const artifactFileName = useCargoWorkspace
    ? path.join('artifacts', wasmByteCodeFilename)
    : path.join('contracts', contract, 'artifacts', wasmByteCodeFilename);

  const wasmByteCode = fs.readFileSync(artifactFileName);
  cli.action.start('storing wasm bytecode on chain');
  const account = await signer.getAccounts();
  console.log(httpEndpoint);
  const cosmwasmClient = await SigningCosmWasmClient.connectWithSigner(httpEndpoint, signer, { gasPrice: DefaulrGasPrice });
  const res = await cosmwasmClient.upload(account[0].address, wasmByteCode, 'auto', 'storecode');

  try {
    const savedCodeId = res.codeId;

    const updatedRefs = setCodeId(
      network,
      contract,
      savedCodeId,
    )(loadRefs(refsPath));
    saveRefs(updatedRefs, refsPath);
    cli.log(`code is stored at code id: ${savedCodeId}`);

    return savedCodeId;
  } catch (error) {
    if (error instanceof SyntaxError) {
      cli.error(res.logs.toString());
    } else {
      cli.error(`Unexpected Error: ${error}`);
    }
  }

  return 0;
};

type InstantiateParams = {
  conf: ContractConfig;
  signer: OfflineAminoSigner;
  network: string;
  refsPath: string;
  httpEndpoint: string;
  admin?: string;
  contract: string;
  codeId?: number;
  instanceId?: string;
  sequence?: number;
};

export const instantiate = async ({
  conf,
  refsPath,
  network,
  httpEndpoint,
  signer,
  admin,
  contract,
  codeId,
  instanceId,
}: InstantiateParams) => {
  const { instantiation } = conf;

  // Ensure contract refs are available in refs.terrain.json.
  const refs = loadRefs(refsPath);
  if (!(network in refs) || !(contract in refs[network])) {
    TerrainCLI.error(
      `Contract "${contract}" has not been deployed on the "${network}" network.`,
      'Contract Not Deployed',
    );
  }

  const actualCodeId = codeId || refs[network][contract].codeId;

  cli.action.start(
    `instantiating contract with msg: ${JSON.stringify(
      instantiation.instantiateMsg,
    )}`,
  );
  const cosmwasmClient = await SigningCosmWasmClient.connectWithSigner(httpEndpoint, signer, { gasPrice: DefaulrGasPrice });
  const account = await signer.getAccounts();
  const res = await cosmwasmClient.instantiate(account[0].address, actualCodeId, instantiation.instantiateMsg, 'Instantiate', 'auto', { admin });
  cli.action.stop();
  const updatedRefs = setContractAddress(
    network,
    contract,
    instanceId || 'default',
    res.contractAddress,
  )(loadRefs(refsPath));
  saveRefs(updatedRefs, refsPath);

  cli.log(YAML.stringify(res.logs));

  return res.contractAddress;
};

type MigrateParams = {
  conf: ContractConfig;
  signer: Secp256k1HdWallet;
  contract: string;
  codeId: number;
  network: string;
  instanceId: string;
  refsPath: string;
  httpEndpoint: string;
};

export const migrate = async ({
  conf,
  refsPath,
  httpEndpoint,
  signer,
  contract,
  codeId,
  network,
  instanceId,
}: MigrateParams) => {
  const { instantiation } = conf;
  const refs = loadRefs(refsPath);
  const contractAddress = refs[network][contract].contractAddresses[instanceId];

  cli.action.start(
    `migrating contract with address ${contractAddress} use mirgate msg: ${JSON.stringify(conf.instantiation.instantiateMsg)} to code id: ${codeId}`,
  );
  const cosmwasmClient = await SigningCosmWasmClient.connectWithSigner(httpEndpoint, signer, { gasPrice: DefaulrGasPrice });
  const account = await signer.getAccounts();
  const res = await cosmwasmClient.migrate(account[0].address, contractAddress, codeId, instantiation.instantiateMsg, 'auto', 'migrate');

  const updatedRefs = setContractAddress(
    network,
    contract,
    instanceId,
    contractAddress,
  )(loadRefs(refsPath));
  saveRefs(updatedRefs, refsPath);
  cli.action.stop();
  cli.log(YAML.stringify(res));
};
