# ByteCraft
---

<p align="center">
  <b>ByteCraft</b> - wasm 智能合约无缝开发平台.
</p>


---

使用bytecraft可以做什么:

- 快速创建wasm合约开发模板.
- 加速合约开发和部署.

---

# 目录

<!-- toc -->
* [ByteCraft](#bytecraft)
* [目录](#目录)
* [安装](#安装)
* [快速入门](#快速入门)
* [升级合约](#升级合约)
* [本地使用 ByteCraft Main分支](#本地使用ByteCraft Main分支)
* [ByteCraft 命令](#ByteCraft 命令)
<!-- tocstop -->

# 安装

## 下载 exchain

为了方便测试, 建议在本地运行exchain.

启动exchain进程, 按照以下步骤:

1. 获取exchain 源码.

```
git clone https://github.com/okx/exchain.git
```

2. 进入cd 目录.

```
cd dev
```

3. 使用start.sh 启动exchain进程.

```
./start.sh
```

## 安装 Rust

虽然wasm可以用任何语言编写, **但强烈建议你使用Rust语言**, 因为只有rust 语言有针对CosmWasm的成熟库和工具. 为了完成本次的教程,按照 <a href="https://www.rust-lang.org/tools/install" target="_blank"> 链接 </a> 的指示安装最新版本的rust即可 . rust安装完成后,做以下事情:

1. 设置默认的正式版渠道用于更新rust至最新稳定版本.

```sh
rustup default stable
```

2. 增加对wasm编译的支持.

```sh
rustup target add wasm32-unknown-unknown
```

3. 安装必要的依赖库用于生成合约.

```sh
cargo install cargo-run-script
```

## 安装 Node JS 和 NPM

确保bytecraft可以正常运行, 需要安装node 16 和 Node Package Manager (npm). 建议安装 [Node.js v16 (LTS)](https://nodejs.org/en/download/).如果你安装了LTS Node.js v16, npm也会随着nodejs 一起安装.

# 开始入门

现在你已经完成了必要的环境配置, 按照以下步骤生成你的第一个wasm智能合约

1. 安装bytecraft工具.

```sh
npm install -g @okexchain/bytecraft
```

2. 生成智能合约工程

```sh
bytecraft new my-wasm-dapp
```

3. 在工程创建完和安装node 必要依赖后, 进入 `my-wasm-dapp` 目录.

```sh
cd my-wasm-dapp
```

## 工程结构

`bytecraft new` 命令会生成一个包含智能合约模板的工程,工程名字由你指定,例如: `my-wasm-dapp`. 其他生成的文件用于支持bytecraft 更高级的功能. 下面你可以看看工程的具体结构.

```
.
├── contracts              # 智能合约目录
│   ├── my-wasm-dapp      #  智能合约模板
│   └── ...
├── lib                    # 预定义的task 和 console 相关功能
├── tasks                  # 预定义的task
├── keys.js        				# 私钥 保存文件
├── config.json    				# 配置网络连接和合约部署相关
└── refs.json      				# 部署的智能及其相关的引用
```

## 部署

 `bytecraft deploy` 命令会做以下事情:

- 构建, 优化, 和 上传 wasm 合约code 到区块链上.
- 初始化合约.

部署你新建 my-wasm-dapp 智能合约, 在终端里运行以下命令.

```sh
 bytecraft deploy my-wasm-dapp --signer test
```

在这个例子中, `test`是作为签名者的. 这个签名帐户支付部署合约到链上的相关费用并且会成为这个合约的所有者.当然你可以通过`--network` 参数指定想要部署的区块链网络. 如果没有指定网络, 部署合约时默认使用  `localnet` . 在部署合约的过程中,如果命令有报错, 你要确保 localnet在正常运行并且在使用ByteCraft命令时正确拼写了合约名. 你可以部署合约到 `mainnet`, 还有一个和主网相似的但是用于测试的 `testnet`.

### 分步部署

你可以按以下顺序执行 build、optimze、store、instantiate 命令完成合约的部署.
1. [`bytecraft contract:build CONTRACT`](#bytecraft-contractbuild-contract)
2. [`bytecraft contract:optimize CONTRACT`](#bytecraft-contractoptimize-contract)
3. [`bytecraft contract:store CONTRACT`](#bytecraft-contractstore-contract)
4. [`bytecraft contract:instantiate CONTRACT`](#bytecraft-contractinstantiate-contract)

<br/>

### 在 Testnet 或者 Mainnet 部署

你需要增加一个私人帐户到`keys.js` 文件通过添加账户名及其对应的私钥或助记词. 后面在使用 `bytecraft deploy` 命令时可以通过增加 --signer 参数指定签名账户

<sub>**警告:** _在开发中使用个人账户需要私钥或者助记词. 这些是在创建个人钱包时生成的私钥. 在自己的计算机上保存或使用这些密钥可能会使其暴露给恶意行为者，如果他们能够获取这些密钥，他们可能会访问你的个人钱包. 你可以创建一个仅用于测试的钱包来消除风险. 或者,你可以将私钥存储为秘密环境变量,然后可以使用`keys.json`中的`process.env.SECRET_VAR`  来引用这些变量. 请自行决定使用私钥或助记词._</sub>

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

在部署合约之前, 确保你的账户里有足够的钱用于支付交易相关手续费.你可以在终端通过执行`bytecraft console` 命令 查询指定账户的地址.

```sh
bytecraft console

bytecraft > wallets.alice.accAddress
'ex1g0xzwvmm7mwxck5fw9y8pygq98gep9lx6m2l6e'
```

然后, 退出bytecraft console, 使用 test 账户将 `my-wasm-dapp` 合约部署到testnet上.

```sh
bytecraft deploy my-wasm-dapp --signer test --network testnet
```

完成部署后, 会更新`refs.json` 文件.这个文件包含所有对已部署合约的引用, 这些合约可以部署在任何exchain上,bytecraft 工具会用到这些信息. 下面是具体 refs.json 文件示例:

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



## 使用ByteCraft 与合约交互

一旦你部署完你的合约, 你可以用`lib/index.js` 中定义的一些方法来跟合约进行交互 . 你也可以在这文件中编写自定的方法用于查询或调用合约. 

你可以在 `bytecraft console` 里调用 `lib/index.js` 中的方法. 下面展示如何与 counter 合约交互.

```sh
bytecraft console
bytecraft > await lib.getCount()
{ count: 0 }
bytecraft > await lib.increment()
bytecraft > await lib.getCount()
{ count: 1 }
```

在执行`bytecraft console` 时可以通过 `--network` 参数指定网络.

```
bytecraft console --network NETWORK
```

## 创建 Tasks

你可以使用 `lib/index.js` 文件中的方法来创建 tasks. Tasks 是用来自动化顺序执行一些方法或命令的.下面的例子你可以在工程的`tasks/example-with-lib.js` 文件中找到.

```js
// tasks/example-with-lib.js

import { Env, task } from "@okexchain/bytecraft";
import Lib from '../lib';

task(async (env: Env) => {
  const lib = new Lib(env);
  console.log("count 1 = ", await lib.getCount());
  
  await lib.increment();
  console.log("count 2 = ", await lib.getCount());
});

```

运行上述的task, 在终端中执行下面命令.

```sh
bytecraft task:run example-with-lib
```

创建新的task, 可以执行下面命令, 输入真实的task名.

```sh
bytecraft task:new <task-name>
```

## 自定义脚本化部署

可以使用task完成合约的部署和初始化. 在多个合约或者多阶段部署时, 这是非常好用的,例如创建一个deploy_counter task: 

```js
const { task } = require("@okexchain/bytecraft");

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

让ByteCraft执行自定义的部署task而不是默认的部署流程. 可以在`config.json`的`_global` 下增加以下内容:

```json
"contracts": {
  "counter": {
    "deployTask": "deploy_counter"
  }
}
```

然后你就可以直接执行 `bytecraft deploy counter` 命令而不是 执行 `bytecraft task:run deploy_counter` 命令.

# 升级 CosmWasm 合约

在 Exchain中,是可以升级合约的. 这允许合约管理员上传新版本的合约,然后发送一个升级message来初始化新版本的合约.新的合约需要包含以下修改才能实现合约升级,否则其他修改就只能通过重新部署的合约的方式生效了.

## 给合约增加 MigrateMsg

为了能升级合约, 合约必须能处理 `MigrateMsg` 交易.

要实现支持 `MigrateMsg`, 把message 添加到 `msg.rs` file. 可以这样做, 打开 `msg.rs` 文件,把下面内容添加到 `InstantiateMsg` 结构上面.

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct MigrateMsg {}
```

这里定义了 `MigrateMsg` 结构, 更新 `contract.rs` 文件. 首先, 导入 `MigrateMsg`.

```rust
use crate::msg::{CountResponse, ExecuteMsg, InstantiateMsg, QueryMsg, MigrateMsg};
```

在 `instantiate` 方法上面增加migrate 方法,如下:

```rust
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn migrate(_deps: DepsMut, _env: Env, _msg: MigrateMsg) -> StdResult<Response> {
    Ok(Response::default())
}
```

## 升级合约

合约增加 MigrateMsg后,合约管理员就可以升级合约了.  在部署完合约后,钱包中负责签名的账户就是这个合约的管理员账户.下面的操作中, 使用test账户签名,将counter合约部署到 localnet , test账户就是counter合约的管理员.

```sh
bytecraft deploy counter --signer test
```

如果你已经更新了合约, 你可以执行下面命令来升级合约.

```sh
bytecraft contract:migrate counter --signer test
```

部署的时候如果想指定管理员账户, 可以添加 `--admin-address` 参数,如下面的所示.

```sh
bytecraft deploy counter --signer test --admin-address <insert-admin-wallet-address>
```

# 本地使用ByteCraft Main分支

某些情况下,最新的特性和bug修复都在<a href="https://github.com/okx/bytecraft" target="_blank">ByteCraft Github repo</a>的main分支,还没来得及发布到<a href="https://www.npmjs.com/package/@okexchain/bytecraft" target="_blank">npm package</a>.随后,你可能希望在发布到npm之前使用Github上提供的最新版本的ByteCraft.下面将会教你如何使用到最新版本的wasmkinfe, 如果你对ByteCraft的开发和贡献感兴趣,也可以使用以下方法.

<sub>**警告:** _最新的版本wamsknife的新功能和bug修复还有待进一步测试. 因此,你只能在特殊情况下使用ByteCraft main分支,在所有其他情况下,使用npm包._</sub>

在本地使用bytecraft main分支,按照以下步骤来.

1. 获取bytecraft 源码.

```
git clone --branch main --depth 1 https://github.com/okx/bytecraft
```

2. 进入bytecraft目录.

```
cd bytecraft
```

3. 在bytecraft工程里执行npm install 安装必须依赖.

```
npm install
```

4.  执行 `npm link`引用本地包,在全局执行bytecraft 命令时就会用到这个包了.

```
npm link
```

如果你想更改某些代码并立马生效,可以在本地ByteCraft目录中执行以下命令.

```
npm run watch
```

解除对本地报的引用.

```
npm unlink bytecraft
```

---

# ByteCraft 命令

<!-- commands -->
* [`bytecraft console`](#bytecraft-console)
* [`bytecraft contract:build CONTRACT`](#bytecraft-contractbuild-contract)
* [`bytecraft contract:generateClient CONTRACT`](#bytecraft-contractgenerateclient-contract)
* [`bytecraft contract:instantiate CONTRACT`](#bytecraft-contractinstantiate-contract)
* [`bytecraft contract:migrate CONTRACT`](#bytecraft-contractmigrate-contract)
* [`bytecraft contract:new NAME`](#bytecraft-contractnew-name)
* [`bytecraft contract:optimize CONTRACT`](#bytecraft-contractoptimize-contract)
* [`bytecraft contract:store CONTRACT`](#bytecraft-contractstore-contract)
* [`bytecraft contract:updateAdmin CONTRACT ADMIN`](#bytecraft-contractupdateadmin-contract-admin)
* [`bytecraft deploy CONTRACT`](#bytecraft-deploy-contract)
* [`bytecraft help [COMMAND]`](#bytecraft-help-command)
* [`bytecraft new NAME`](#bytecraft-new-name)
* [`bytecraft task:new [TASK]`](#bytecraft-tasknew-task)
* [`bytecraft task:run [TASK]`](#bytecraft-taskrun-task)
* [`bytecraft test CONTRACT-NAME`](#bytecraft-test-contract-name)
* [`bytecraft test:coverage [CONTRACT-NAME]`](#bytecraft-testcoverage-contract-name)
* [`bytecraft wallet:new`](#bytecraft-walletnew)

## `bytecraft console`

启动一个repl控制台,该控制台提供上下文和方便的api去跟链和合约交互.

```
USAGE
  $ bytecraft console [--signer <value>] [--network <value>] [--config-path <value>] [--refs-path <value>]
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

_See code: [src/commands/console.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/console.ts)_

## `bytecraft contract:build CONTRACT`

编译wasm字节码.

```
USAGE
  $ bytecraft contract:build [CONTRACT] [--config-path <value>]

FLAGS
  --config-path=<value>  [default: ./config.json]

DESCRIPTION
  Build wasm bytecode.
```

_See code: [src/commands/contract/build.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/contract/build.ts)_

## `bytecraft contract:generateClient CONTRACT`

生成一个链的 TypeScript 客户端.

```
USAGE
  $ bytecraft contract:generateClient [CONTRACT] [--lib-path <value>] [--build-schema]

FLAGS
  --build-schema
  --lib-path=<value>  [default: lib] location to place the generated client

DESCRIPTION
  Generate a Chain TypeScript client.
```

_See code: [src/commands/contract/generateClient.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/contract/generateClient.ts)_

## `bytecraft contract:instantiate CONTRACT`

初始化合约.

```
USAGE
  $ bytecraft contract:instantiate [CONTRACT] [--signer <value>] [--network <value>] [--instance-id <value>] [--code-id
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

_See code: [src/commands/contract/instantiate.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/contract/instantiate.ts)_

## `bytecraft contract:migrate CONTRACT`

升级合约.

```
USAGE
  $ bytecraft contract:migrate [CONTRACT] [--signer <value>] [--no-rebuild] [--network <value>] [--config-path
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

_See code: [src/commands/contract/migrate.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/contract/migrate.ts)_

## `bytecraft contract:new NAME`

创建新合约.

```
USAGE
  $ bytecraft contract:new [NAME] [--path <value>] [--version <value>] [--authors <value>]

FLAGS
  --authors=<value>  [default: OKX okc <core@okg.com>]
  --path=<value>     [default: contracts] path to keep the contracts
  --version=<value>  [default: 1.0]

DESCRIPTION
  Generate new contract.

EXAMPLES
  $ bytecraft code:new awesome_contract

  $ bytecraft code:new awesome_contract --path path/to/dapp

  $ bytecraft code:new awesome_contract --path path/to/dapp --authors "ExampleAuthor<example@email.domain>"
```

_See code: [src/commands/contract/new.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/contract/new.ts)_

## `bytecraft contract:optimize CONTRACT`

优化wasm字节码.

```
USAGE
  $ bytecraft contract:optimize [CONTRACT] [--config-path <value>]

FLAGS
  --config-path=<value>  [default: ./config.json]

DESCRIPTION
  Optimize wasm bytecode.
```

_See code: [src/commands/contract/optimize.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/contract/optimize.ts)_

## `bytecraft contract:store CONTRACT`

部署合约code.

```
USAGE
  $ bytecraft contract:store [CONTRACT] [--signer <value>] [--network <value>] [--no-rebuild] [--config-path
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

_See code: [src/commands/contract/store.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/contract/store.ts)_

## `bytecraft contract:updateAdmin CONTRACT ADMIN`

更新合约管理员

```
USAGE
  $ bytecraft contract:updateAdmin [CONTRACT] [ADMIN] [--signer <value>] [--network <value>] [--config-path <value>]
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

_See code: [src/commands/contract/updateAdmin.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/contract/updateAdmin.ts)_

## `bytecraft deploy CONTRACT`

部署合约:构建合约字节码、优化字节码、并部署code到链上、完成合约的初始化操作.

```
USAGE
  $ bytecraft deploy [CONTRACT] [--signer <value>] [--network <value>] [--no-rebuild] [--instance-id
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

_See code: [src/commands/deploy.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/deploy.ts)_

## `bytecraft help [COMMAND]`

展示帮助信息

```
USAGE
  $ bytecraft help [COMMAND] [--all]

ARGUMENTS
  COMMAND  command to show help for

FLAGS
  --all  see all commands in CLI

DESCRIPTION
  display help for bytecraft
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.18/src/commands/help.ts)_

## `bytecraft new NAME`

创建一个新的工程.

```
USAGE
  $ bytecraft new [NAME] [--path <value>] [--version <value>] [--authors <value>]

FLAGS
  --authors=<value>  [default: OKC <okc@okg.com>]
  --path=<value>     [default: .] Path to create the workspace
  --version=<value>  [default: 1.0]

DESCRIPTION
  Create new dapp from template.

EXAMPLES
  $ bytecraft new awesome-dapp

  $ bytecraft new awesome-dapp --path path/to/dapp

  $ bytecraft new awesome-dapp --path path/to/dapp --authors "ExampleAuthor<example@email.domain>"
```

_See code: [src/commands/new.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/new.ts)_

## `bytecraft task:new [TASK]`

创建task

```
USAGE
  $ bytecraft task:new [TASK]

DESCRIPTION
  create new task
```

_See code: [src/commands/task/new.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/task/new.ts)_

## `bytecraft task:run [TASK]`

run predefined task

```
USAGE
  $ bytecraft task:run [TASK] [--signer <value>] [--network <value>] [--config-path <value>] [--refs-path
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

_See code: [src/commands/task/run.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/task/run.ts)_

## `bytecraft test CONTRACT-NAME`

执行合约单元测试.

```
USAGE
  $ bytecraft test [CONTRACT-NAME] [--no-fail-fast]

FLAGS
  --no-fail-fast  Run all tests regardless of failure.

DESCRIPTION
  Runs unit tests for a contract directory.

EXAMPLES
  $ bytecraft test counter

  $ bytecraft test counter --no-fail-fast
```

_See code: [src/commands/test.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/test.ts)_

## `bytecraft test:coverage [CONTRACT-NAME]`

收集单元测试覆盖率.

```
USAGE
  $ bytecraft test:coverage [CONTRACT-NAME]

DESCRIPTION
  Runs unit tests for a contract directory.

EXAMPLES
  $ bytecraft test:coverage

  $ bytecraft test:coverage counter
```

_See code: [src/commands/test/coverage.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/test/coverage.ts)_

## `bytecraft wallet:new`

创建一个新钱包

```
USAGE
  $ bytecraft wallet:new [--outfile <value>]

FLAGS
  --outfile=<value>  absolute path to store the mnemonic key to. If omitted, output to stdout

DESCRIPTION
  Generate a new wallet to use for signing contracts
```

_See code: [src/commands/wallet/new.ts](https://github.com/okx/bytecraft/blob/v0.1.7/src/commands/wallet/new.ts)_
<!-- commandsstop -->
