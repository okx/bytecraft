# WasmKnife
[简体中文](./README_zh_cn.md)
---

<p align="center">
  <b>WasmKnife</b> - A Wasm development environment for seamless smart contract development.
</p>

---

WasmKnife allows you to:

- Scaffold a template smart contract app development.
- Dramatically simplify the development and deployment process.

---

# Table of contents

<!-- toc -->
* [WasmKnife](#wasmknife)
* [Table of contents](#table-of-contents)
* [Setup](#setup)
* [Getting Started](#getting-started)
* [Migrating CosmWasm Contracts](#migrating-cosmwasm-contracts)
* [Use WasmKnife Main Branch Locally](#use-wasmknife-main-branch-locally)
* [WasmKnife Commands](#wasmknife-commands)
<!-- tocstop -->

# Setup

## Download exchain

For testing purposes, we recommend to install and run exchain on your personal computer. 

To run local exchain, do the following:

1. Clone the exchain repo.

```
git clone https://github.com/okex/exchain.git
```

2. Navigate to the dev directory.

```
cd dev
```

3. Spin up an exchain instance with start.sh script.

```
./start.sh
```

## Setup Rust

While WASM smart contracts can be written in any programming language, **it is strongly recommended that you utilize Rust**, as it is the only language for which mature libraries and tooling exist for CosmWasm. To complete this tutorial, install the latest version of Rust by following the instructions <a href="https://www.rust-lang.org/tools/install" target="_blank">here</a>. Once Rust is installed on your computer, do the following:

1. Set the default release channel used to update Rust to stable.

```sh
rustup default stable
```

2. Add wasm as the compilation target.

```sh
rustup target add wasm32-unknown-unknown
```

3. Install the necessary dependencies for generating contracts.

```sh
cargo install cargo-run-script
```

## Install Node JS and NPM

To run WasmKnife, you will need to install version 16 of Node.js and download Node Package Manager (npm). It is recommend that you install [Node.js v16 (LTS)](https://nodejs.org/en/download/). If you download the LTS version of Node.js v16, npm will be automatically installed along with your download.

# Getting Started

Now that you have completed the initial setup, generate your first smart contract using the procedure described below.

1. Install the wasmknife package globally.

```sh
npm install -g @okexchain/wasmknife
```

2. Generate your smart contract templates.

```sh
wasmknife new my-wasm-dapp
```

3. After the project is generated and all necessary Node dependencies are installed, navigate to the new `my-wasm-dapp` directory to interact with your app.

```sh
cd my-wasm-dapp
```

## Project Structure

The `wasmknife new` command generates a project that contains a template smart contract, which is named after the specified app name, `my-wasm-dapp`. Other supporting files are generated to provide further functionality. You may view the project structure below.

```
.
├── contracts              # the smart contract directory
│   ├── my-wasm-dapp      # template smart contract
│   └── ...
├── lib                    # predefined task and console functions
├── tasks                  # predefined tasks
├── keys.js        				# keys for signing transactions
├── config.json    				# config for connections and contract deployments
└── refs.json      				# deployed code and contract references
```

## Deployment

The `wasmknife deploy` command does the following:

- Builds, optimizes, and stores the wasm code on the blockchain.
- Instantiates the contract.

To deploy your new my-wasm-dapp smart contract, run the following command in the terminal.

```sh
 wasmknife deploy my-wasm-dapp --signer test
```

In this case, `test`, as our signer. The signer account will be responsible for paying the gas fee associated with deploying the contract to the exchain blockchain and will be assigned as the owner of the project.

You can also specify the network on which you would like to deploy your contract by adding the `--network` flag. If the network is not specified, as is the case in our above example, your contract will be deployed to `localnet` by default. If your deployment command in the prior step resulted in an error, you will need to ensure that localnet is up and running in the background and that you have properly spelled out your contract name and are utilizing the appropriate WasmKnife command. You may also deploy to `mainnet`, the live exchain blockchain, as well as `testnet`, a network similar to mainnet used for testing.

### Step-by-step Deployment

You can also execute the build, optimize, store, and instantiate processes separately by executing the following commands in sequential order.
1. [`wasmknife contract:build CONTRACT`](#wasmknife-contractbuild-contract)
2. [`wasmknife contract:optimize CONTRACT`](#wasmknife-contractoptimize-contract)
3. [`wasmknife contract:store CONTRACT`](#wasmknife-contractstore-contract)
4. [`wasmknife contract:instantiate CONTRACT`](#wasmknife-contractinstantiate-contract)

<br/>

### Deploying on Testnet or Mainnet

You should  add a personal account to the `keys.js` file by adding the account name as well as its corresponding private key. You can then use that account as the signer specifying the account name after the `--signer` flag in the `wasmknife deploy` command.

<sub>**Warning:** _Utilizing a personal account for deployment requires the use of a private key or mnemonic. These are private keys that are generated upon the creation of your personal wallet. Saving or utilizing these keys on your personal computer may expose them to malicious actors who could gain access to your personal wallet if they are able to obtain them. You can create a wallet solely for testing purposes to eliminate risk. Alternatively, you can store your private keys as secret environment variables which you can then reference utilizing `process.env.SECRET_VAR` in `keys.json`. Use your private key or mnemonic at your own discretion._</sub>

```js
// can use `process.env.SECRET_MNEMONIC` or `process.env.SECRET_PRIV_KEY`
// to populate secret in CI environment instead of hardcoding

module.exports = {
  test: {
    mnemonic:
      "abstract milk alien mosquito consider swarm write outside detail faith peanut feel",
  },
  alice: {
    privateKey: "43792143508f053a8b82dd83e1d56c82dc04cd0fcc86220175ef591911fa65c1",
  },
};
```

Prior to deploying your contract, ensure that your signer wallet contains the funds needed to pay for associated transaction fees.

You can retrieve the wallet address associated with the `alice` account by executing the `wasmknife console` command in your terminal while in your project directory.

```sh
wasmknife console

wasmknife > wallets.alice.accAddress
'ex1g0xzwvmm7mwxck5fw9y8pygq98gep9lx6m2l6e'
```

Then, exit the wasmknife console and deploy the `my-wasm-dapp` smart contract to testnet with the `test` account as the signer.

```sh
wasmknife deploy my-wasm-dapp --signer test --network testnet
```

After deployment, the `refs.json` file will be updated in the project directory. These files contain references to all contracts inside of your project which have been stored on any exchain network. This information is utilized by wasmknife's utility functions. An example of `refs.json` can be found below:

```json
{
  "localnet": {
    "counter": {
      "codeId": "1",
      "contractAddresses": {
        "default": "ex10qt8wg0n7z740ssvf3urmvgtjhxpyp74hxqvqt7z226gykuus7equ3f4hk"
      }
    }
  },
  "testnet": {
    "my-wasm-dapp": {
      "codeId": "18160",
      "contractAddresses": {
        "default": "ex1wr6vc3g4caz9aclgjacxewr0pjlre9wl2uhq73rp8mawwmqaczsq6p3y6f"
      }
    }
  }
}
```



## Run Contract Functions with WasmKnife

Once you have successfully deployed your project, you can interact with the deployed contract and the underlying blockchain by utilizing functions defined in the `lib/index.js` file. You may also create your own abstractions in this file for querying or executing transactions. 

You can call the functions defined in `lib/index.js` inside of the `wasmknife console`. An example using the template counter smart contract is shown below.

```sh
wasmknife console
wasmknife > await lib.getCount()
{ count: 0 }
wasmknife > await lib.increment()
wasmknife > await lib.getCount()
{ count: 1 }
```

You may also specify which network you would like to interact with by utilizing the `--network` flag with the `wasmknife console` command.

```
wasmknife console --network NETWORK
```

## Creating Tasks

You can utilize the functions available inside of the `lib/index.js` file to create tasks. Tasks are utilized in order to automate the execution of sequential functions or commands. An example task is provided for you in the `tasks/example-with-lib.js` file in your project directory.

```js
// tasks/example-with-lib.js

import { Env, task } from "@okexchain/wasmknife";
import Lib from '../lib';

task(async (env: Env) => {
  const lib = new Lib(env);
  console.log("count 1 = ", await lib.getCount());
  
  await lib.increment();
  console.log("count 2 = ", await lib.getCount());
});

```

To run the example task shown above, which is located in the `tasks/example-with-lib.js` file, run the following command in the terminal.

```sh
wasmknife task:run example-with-lib
```

In order to create a new task, run the following command replacing `<task-name>` with the desired name for your new task.

```sh
wasmknife task:new <task-name>
```

## Scripting deployments

It is possible to deploy and instantiate contracts from tasks. This can be useful for multi-contract, or multi-stage deployments. 

```js
const { task } = require("@okexchain/wasmknife");

task(async ({ defaultWallet, client, deploy }) => {
    // First deploy the counter smart contract.
    await deploy.storeCode('mydapp', defaultWallet);
    const accounts = await defaultWallet.getAccounts()
    const counterAddress = await deploy.instantiate(
        // Contract name
        'mydapp',
        // Signer
        defaultWallet,
        {
            // Contract admin
            admin: accounts[0].address,
            init: {count: 1},
        },
    );

    // Now deploy a CW20 with the counter contract set as the minter in instantiation
    await deploy.storeCode('cw20-base', defaultWallet);
    const cw20Address = await deploy.instantiate(
        // Contract name
        'cw20-base',
        // Signer
        defaultWallet,
        {
            // Contract admin
            admin: accounts[0].address,
            init: {
                name: "counter",
                symbol: "CTR",
                decimals: 6,
                initial_balances: [],
                mint: {
                    minter: counterAddress,
                },
            },
        },
    );

    await client.execute(counterAddress, defaultWallet, {
        update_token: { token: cw20Address },
    });

    console.log(`CW20 Address: ${cw20Address}`);
});
```

It is possible to tell WasmKnife to use a custom deploy task instead of the default deploy process. To do this, add the following to the `_global` section in `config.json`:

```json
"contracts": {
  "counter": {
    "deployTask": "deploy_counter"
  }
}
```

Now instead of running `wasmknife task:run deploy_counter` you can run `wasmknife deploy counter`.

# Migrating CosmWasm Contracts

On Exchain, it is possible to initialize a contract as migratable. This functionality allows the administrator to upload a new version of the contract and then send a migrate message to move to the new code. Contracts that have been deployed before implementing the following changes will not be able to be migrated and implemented changes will only be realized when redeploying the contract.

## Adding MigrateMsg to the Contract

In order for a contract to be migratable, it must be able to handle a `MigrateMsg` transaction.

To implement support for `MigrateMsg`, add the message to the `msg.rs` file. To do so, navigate to `msg.rs` and place the following code just above the `InstantiateMsg` struct.

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct MigrateMsg {}
```

With `MigrateMsg` defined, update the `contract.rs` file. First, update the import from `crate::msg` to include `MigrateMsg`.

```rust
use crate::msg::{CountResponse, ExecuteMsg, InstantiateMsg, QueryMsg, MigrateMsg};
```

Next, add the following method above `instantiate`.

```rust
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn migrate(_deps: DepsMut, _env: Env, _msg: MigrateMsg) -> StdResult<Response> {
    Ok(Response::default())
}
```

## Migrating the Contract

Adding the MigrateMsg to the smart contract allows the contract's administrator to migrate the contract in the future.  When we deploy our contract, the wallet address of the signer will be automatically designated as the contract administrator.  In the following command, the contract is deployed with the preconfigured Localnet `test1` wallet as the signer and administrator of our counter contract. 

```sh
wasmknife deploy counter --signer test
```

If you decide to make changes to the deployed contract, you can migrate to the updated code by executing the following command.

```sh
wasmknife contract:migrate counter --signer test
```

If you would like to specify the address of the desired administrator for your smart contract, you may utilize the `--admin-address` flag in the deploy command followed by the wallet address of the desired administrator.

```sh
wasmknife deploy counter --signer test --admin-address <insert-admin-wallet-address>
```

# Use WasmKnife Main Branch Locally

In some cases, the latest features or bug fixes may be integrated into the main branch of the <a href="https://github.com/okex/wasmknife" target="_blank">WasmKnife Github repo</a>, but not yet released to the corresponding <a href="https://www.npmjs.com/package/@okexchain/wasmknife" target="_blank">npm package</a>. Subsequently, you may want to use the latest version of  WasmKnife available on Github before it has been released to npm. The below described method may also be utilized if you are interested in developing on and contributing to WasmKnife.

<sub>**Warning:** _Features and bug fixes that are implemented on the latest version of WasmKnife may still be subject to testing. As such, you should only use the main branch of the Wasmknife github repo in exceptional circumstances. In all other cases, use the npm package._</sub>

To use the main branch of the WasmKnife repo on your local machine, follow the procedure below.

1. Clone the repo.

```
git clone --branch main --depth 1 https://github.com/okex/wasmknife
```

2. Navigate to the project folder.

```
cd wasmknife
```

3. Inside the project folder, install all necessary node dependencies.

```
npm install
```

4.  Run the `npm link` command to set up the local repository as your global wasmknife instance.

```
npm link
```

If you would like to witness your changes immediately upon saving them, you may execute the following command while in your local WasmKnife directory and allow it to run in a tab in your terminal.

```
npm run watch
```

To unlink the wasmknife command from the cloned repository and revert back to the default functionality, you can execute the below command.

```
npm unlink wasmknife
```

---

# WasmKnife Commands

<!-- commands -->
* [`wasmknife console`](#wasmknife-console)
* [`wasmknife contract:build CONTRACT`](#wasmknife-contractbuild-contract)
* [`wasmknife contract:generateClient CONTRACT`](#wasmknife-contractgenerateclient-contract)
* [`wasmknife contract:instantiate CONTRACT`](#wasmknife-contractinstantiate-contract)
* [`wasmknife contract:migrate CONTRACT`](#wasmknife-contractmigrate-contract)
* [`wasmknife contract:new NAME`](#wasmknife-contractnew-name)
* [`wasmknife contract:optimize CONTRACT`](#wasmknife-contractoptimize-contract)
* [`wasmknife contract:store CONTRACT`](#wasmknife-contractstore-contract)
* [`wasmknife contract:updateAdmin CONTRACT ADMIN`](#wasmknife-contractupdateadmin-contract-admin)
* [`wasmknife deploy CONTRACT`](#wasmknife-deploy-contract)
* [`wasmknife help [COMMAND]`](#wasmknife-help-command)
* [`wasmknife new NAME`](#wasmknife-new-name)
* [`wasmknife task:new [TASK]`](#wasmknife-tasknew-task)
* [`wasmknife task:run [TASK]`](#wasmknife-taskrun-task)
* [`wasmknife test CONTRACT-NAME`](#wasmknife-test-contract-name)
* [`wasmknife test:coverage [CONTRACT-NAME]`](#wasmknife-testcoverage-contract-name)
* [`wasmknife wallet:new`](#wasmknife-walletnew)

## `wasmknife console`

Start a repl console that provides context and convenient utilities to interact with the blockchain and your contracts.

```
USAGE
  $ wasmknife console [--signer <value>] [--network <value>] [--config-path <value>] [--refs-path <value>]
    [--keys-path <value>]

FLAGS
  --config-path=<value>  [default: ./config.json]
  --keys-path=<value>    [default: ./keys.js]
  --network=<value>      [default: localnet] network to deploy to from config.json
  --refs-path=<value>    [default: ./refs.json]
  --signer=<value>       [default: test]

DESCRIPTION
  Start a repl console that provides context and convenient utilities to interact with the blockchain and your
  contracts.
```

_See code: [src/commands/console.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/console.ts)_

## `wasmknife contract:build CONTRACT`

Build wasm bytecode.

```
USAGE
  $ wasmknife contract:build [CONTRACT] [--config-path <value>]

FLAGS
  --config-path=<value>  [default: ./config.json]

DESCRIPTION
  Build wasm bytecode.
```

_See code: [src/commands/contract/build.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/contract/build.ts)_

## `wasmknife contract:generateClient CONTRACT`

Generate a Chain TypeScript client.

```
USAGE
  $ wasmknife contract:generateClient [CONTRACT] [--lib-path <value>] [--build-schema]

FLAGS
  --build-schema
  --lib-path=<value>  [default: lib] location to place the generated client

DESCRIPTION
  Generate a Chain TypeScript client.
```

_See code: [src/commands/contract/generateClient.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/contract/generateClient.ts)_

## `wasmknife contract:instantiate CONTRACT`

Instantiate the contract.

```
USAGE
  $ wasmknife contract:instantiate [CONTRACT] [--signer <value>] [--network <value>] [--instance-id <value>] [--code-id
    <value>] [--config-path <value>] [--refs-path <value>] [--keys-path <value>]

FLAGS
  --code-id=<value>      specific codeId to instantiate
  --config-path=<value>  [default: ./config.json]
  --instance-id=<value>  [default: default]
  --keys-path=<value>    [default: ./keys.js]
  --network=<value>      [default: localnet] network to deploy to from config.json
  --refs-path=<value>    [default: ./refs.json]
  --signer=<value>       [default: test]

DESCRIPTION
  Instantiate the contract.
```

_See code: [src/commands/contract/instantiate.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/contract/instantiate.ts)_

## `wasmknife contract:migrate CONTRACT`

Migrate the contract.

```
USAGE
  $ wasmknife contract:migrate [CONTRACT] [--signer <value>] [--no-rebuild] [--network <value>] [--config-path
    <value>] [--refs-path <value>] [--keys-path <value>] [--instance-id <value>]

FLAGS
  --config-path=<value>  [default: config.json]
  --instance-id=<value>  [default: default]
  --keys-path=<value>    [default: keys.js]
  --network=<value>      [default: localnet]
  --no-rebuild           deploy the wasm bytecode as is.
  --refs-path=<value>    [default: refs.json]
  --signer=<value>       [default: test]

DESCRIPTION
  Migrate the contract.
```

_See code: [src/commands/contract/migrate.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/contract/migrate.ts)_

## `wasmknife contract:new NAME`

Generate new contract.

```
USAGE
  $ wasmknife contract:new [NAME] [--path <value>] [--version <value>] [--authors <value>]

FLAGS
  --authors=<value>  [default: OKX okc <core@okg.com>]
  --path=<value>     [default: contracts] path to keep the contracts
  --version=<value>  [default: 1.0]

DESCRIPTION
  Generate new contract.

EXAMPLES
  $ wasmknife code:new awesome_contract

  $ wasmknife code:new awesome_contract --path path/to/dapp

  $ wasmknife code:new awesome_contract --path path/to/dapp --authors "ExampleAuthor<example@email.domain>"
```

_See code: [src/commands/contract/new.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/contract/new.ts)_

## `wasmknife contract:optimize CONTRACT`

Optimize wasm bytecode.

```
USAGE
  $ wasmknife contract:optimize [CONTRACT] [--config-path <value>]

FLAGS
  --config-path=<value>  [default: ./config.json]

DESCRIPTION
  Optimize wasm bytecode.
```

_See code: [src/commands/contract/optimize.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/contract/optimize.ts)_

## `wasmknife contract:store CONTRACT`

Store code on chain.

```
USAGE
  $ wasmknife contract:store [CONTRACT] [--signer <value>] [--network <value>] [--no-rebuild] [--config-path
    <value>] [--refs-path <value>] [--keys-path <value>]

FLAGS
  --config-path=<value>  [default: ./config.json]
  --keys-path=<value>    [default: ./keys.js]
  --network=<value>      [default: localnet] network to deploy to from config.json
  --no-rebuild           deploy the wasm bytecode as is.
  --refs-path=<value>    [default: ./refs.json]
  --signer=<value>       [default: test]

DESCRIPTION
  Store code on chain.
```

_See code: [src/commands/contract/store.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/contract/store.ts)_

## `wasmknife contract:updateAdmin CONTRACT ADMIN`

Update the admin of a contract.

```
USAGE
  $ wasmknife contract:updateAdmin [CONTRACT] [ADMIN] [--signer <value>] [--network <value>] [--config-path <value>]
    [--refs-path <value>] [--keys-path <value>] [--instance-id <value>]

FLAGS
  --config-path=<value>  [default: config.json]
  --instance-id=<value>  [default: default]
  --keys-path=<value>    [default: keys.js]
  --network=<value>      [default: localnet] network to deploy to from config.json
  --refs-path=<value>    [default: refs.json]
  --signer=<value>       [default: test]

DESCRIPTION
  Update the admin of a contract.
```

_See code: [src/commands/contract/updateAdmin.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/contract/updateAdmin.ts)_

## `wasmknife deploy CONTRACT`

Build wasm bytecode, store code on chain and instantiate.

```
USAGE
  $ wasmknife deploy [CONTRACT] [--signer <value>] [--network <value>] [--no-rebuild] [--instance-id
    <value>] [--admin-address <value>] [--config-path <value>] [--refs-path <value>] [--keys-path <value>]

FLAGS
  --admin-address=<value>  set custom address as contract admin to allow migration.
  --config-path=<value>    [default: ./config.json]
  --instance-id=<value>    [default: default] enable management of multiple instances of the same contract
  --keys-path=<value>      [default: ./keys.js]
  --network=<value>        [default: localnet] network to deploy to from config.json
  --no-rebuild             deploy the wasm bytecode as is.
  --refs-path=<value>      [default: ./refs.json]
  --signer=<value>         [default: test]

DESCRIPTION
  Build wasm bytecode, store code on chain and instantiate.
```

_See code: [src/commands/deploy.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/deploy.ts)_

## `wasmknife help [COMMAND]`

display help for wasmknife

```
USAGE
  $ wasmknife help [COMMAND] [--all]

ARGUMENTS
  COMMAND  command to show help for

FLAGS
  --all  see all commands in CLI

DESCRIPTION
  display help for wasmknife
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.18/src/commands/help.ts)_

## `wasmknife new NAME`

Create new dapp from template.

```
USAGE
  $ wasmknife new [NAME] [--path <value>] [--version <value>] [--authors <value>]

FLAGS
  --authors=<value>  [default: OKC <okc@okg.com>]
  --path=<value>     [default: .] Path to create the workspace
  --version=<value>  [default: 1.0]

DESCRIPTION
  Create new dapp from template.

EXAMPLES
  $ wasmknife new awesome-dapp

  $ wasmknife new awesome-dapp --path path/to/dapp

  $ wasmknife new awesome-dapp --path path/to/dapp --authors "ExampleAuthor<example@email.domain>"
```

_See code: [src/commands/new.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/new.ts)_

## `wasmknife task:new [TASK]`

create new task

```
USAGE
  $ wasmknife task:new [TASK]

DESCRIPTION
  create new task
```

_See code: [src/commands/task/new.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/task/new.ts)_

## `wasmknife task:run [TASK]`

run predefined task

```
USAGE
  $ wasmknife task:run [TASK] [--signer <value>] [--network <value>] [--config-path <value>] [--refs-path
    <value>] [--keys-path <value>]

FLAGS
  --config-path=<value>  [default: config.json]
  --keys-path=<value>    [default: keys.js]
  --network=<value>      [default: localnet]
  --refs-path=<value>    [default: refs.json]
  --signer=<value>       [default: test]

DESCRIPTION
  run predefined task
```

_See code: [src/commands/task/run.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/task/run.ts)_

## `wasmknife test CONTRACT-NAME`

Runs unit tests for a contract directory.

```
USAGE
  $ wasmknife test [CONTRACT-NAME] [--no-fail-fast]

FLAGS
  --no-fail-fast  Run all tests regardless of failure.

DESCRIPTION
  Runs unit tests for a contract directory.

EXAMPLES
  $ wasmknife test counter

  $ wasmknife test counter --no-fail-fast
```

_See code: [src/commands/test.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/test.ts)_

## `wasmknife test:coverage [CONTRACT-NAME]`

Runs unit tests for a contract directory.

```
USAGE
  $ wasmknife test:coverage [CONTRACT-NAME]

DESCRIPTION
  Runs unit tests for a contract directory.

EXAMPLES
  $ wasmknife test:coverage

  $ wasmknife test:coverage counter
```

_See code: [src/commands/test/coverage.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/test/coverage.ts)_

## `wasmknife wallet:new`

Generate a new wallet to use for signing contracts

```
USAGE
  $ wasmknife wallet:new [--outfile <value>]

FLAGS
  --outfile=<value>  absolute path to store the mnemonic key to. If omitted, output to stdout

DESCRIPTION
  Generate a new wallet to use for signing contracts
```

_See code: [src/commands/wallet/new.ts](https://github.com/okex/wasmknife/blob/v0.1.4/src/commands/wallet/new.ts)_
<!-- commandsstop -->
