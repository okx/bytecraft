import { Help } from '@oclif/core';
import { Secp256k1HdWallet, SigningCosmWasmClient } from "cosmwasm";
import { stringToPath } from "@cosmjs/crypto";

function bold(text: string) {
  return `\x1B[1m${text}\x1B[0m`;
}

function indent(text: string) {
  return `  ${text}`;
}

export default class CustomHelp extends Help {
  async showRootHelp() {
    await super.showRootHelp();
    console.log(bold('REPOSITORY'));
    console.log(indent('https://github.com/okex/wasmknife'));

    const hdPath = [stringToPath("m/44'/118'/0'/0/0")];

    // @ts-ignore
    // const acc = await Secp256k1HdWallet.fromMnemonic('abstract milk alien mosquito consider swarm write outside detail faith peanut feel', { hdPaths: hdPath, prefix: 'ex' })
    // const accs = await acc.getAccounts();
    //
    // console.log(accs[0].address);
    // console.log(Buffer.from(accs[0].pubkey).toString('hex'));
  }
}
