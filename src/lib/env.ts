import { Secp256k1HdWallet, Secp256k1Wallet, SigningCosmWasmClient } from "cosmwasm";


// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineAminoSigner } from '@cosmjs/amino/build/signer';
import {
  ContractConfig,
  ContractRef,
  InstantiateMessage,
  loadConfig,
  loadGlobalConfig,
  loadConnections,
  loadKeys,
  loadRefs,
} from "../config";
import {
  storeCode,
  instantiate,
  build,
  optimize
} from "./deployment";
import { ExchainClientExtra } from "./ExchainClientExtra";
import { DefaulrGasPrice, Key } from "./key";


export type DeployHelpers = {
  build: (contract: string) => Promise<void>;
  optimize: (
    contract: string
  ) => Promise<void>;
  storeCode: (
    contract: string,
    signer: OfflineAminoSigner,
    options?: {
      noRebuild?: boolean,
    }
  ) => Promise<number>;
  instantiate: (
    contract: string,
    signer: OfflineAminoSigner,
    options?: {
      codeId?: number,
      instanceId?: string,
      admin?: string,
      init?: InstantiateMessage,
    }
  ) => Promise<string>;
};

export type Env = {
  cosmwasmClient: SigningCosmWasmClient,
  config: (contract: string) => ContractConfig;
  refs: { [contractName: string]: ContractRef };
  wallets: { [key: string]: OfflineAminoSigner };
  defaultWallet: OfflineAminoSigner;
  client: ExchainClientExtra;
  deploy: DeployHelpers;
  address: string,
};


export const getEnv = async (
  configPath: string,
  keysPath: string,
  refsPath: string,
  network: string,
  defaultWallet: string,
): Promise<Env> => {
  const connections = loadConnections(configPath);
  const config = loadConfig(configPath);
  const globalConfig = loadGlobalConfig(configPath);
  const keys = loadKeys(keysPath);
  const refs = loadRefs(refsPath)[network];
  const lcd = new ExchainClientExtra(connections(network).URL, refs);

  let userDefinedWallets: { [k: string]: OfflineAminoSigner } = {};

  for (let k in keys) {
    let wallet: OfflineAminoSigner;
    if (keys[k].privateKey === '') {
      // const path = stringToPath("m/44'/118'/0'/0/0");
      // eslint-disable-next-line no-await-in-loop
      wallet = await Secp256k1HdWallet.fromMnemonic(keys[k].mnemonic, {
        // hdPaths: [path],
        prefix: 'ex',
      });
    } else {
      // eslint-disable-next-line no-await-in-loop
      wallet = await Secp256k1Wallet.fromKey(Buffer.from(keys[k].privateKey, 'hex'), 'ex');
    }

    userDefinedWallets[k] = wallet;
  }
  const wallets: { [k: string]: OfflineAminoSigner } = {
    ...userDefinedWallets,
  };

  if (!(defaultWallet in wallets)) {
    throw new Error('default wallet not found');
  }

  const accounts = await wallets[defaultWallet].getAccounts();
  const sender = accounts[0].address;
  const cosmwasmClient = await SigningCosmWasmClient.connectWithSigner(lcd.httpEndpoint, wallets[defaultWallet], {gasPrice: DefaulrGasPrice});

  // @ts-ignore
  // @ts-ignore
  return {
    cosmwasmClient: cosmwasmClient,
    address: sender,
    config: (contract) => config(network, contract),
    refs,
    wallets,
    defaultWallet: wallets[defaultWallet],
    client: lcd,
    // Enable tasks to deploy code.
    deploy: {
      build: (contract: string) => build({
        contract,
      }),
      optimize: (contract: string) => optimize({
        contract,
        useCargoWorkspace: globalConfig.useCargoWorkspace,
      }),
      storeCode: (contract: string, signer: OfflineAminoSigner, options) => storeCode({
        contract,
        signer,
        network,
        refsPath,
        httpEndpoint: lcd.httpEndpoint,
        conf: config(network, contract),
        noRebuild: typeof options?.noRebuild === "undefined" ? false : options.noRebuild,
        useCargoWorkspace: globalConfig.useCargoWorkspace,
      }),
      instantiate: (
        contract: string,
        signer: OfflineAminoSigner,
        options
      ) => instantiate({
        instanceId: options?.instanceId,
        codeId: options?.codeId,
        signer,
        contract,
        network,
        refsPath,
        httpEndpoint: lcd.httpEndpoint,
        admin: options?.admin,
        // Use the instantiation message passed instead of default.
        conf: options?.init
          ? { instantiation: { instantiateMsg: options.init } }
          : config(network, contract)
      })
    }
  };
};
