import chalk, { Chalk } from 'chalk';
import cli from 'cli-ux';
import boxen from 'boxen';
import semver from 'semver';
import dedent from 'dedent';

/** CLI offers default log styling for wasmknife commands. */
class CLI {
  prefix: string;

  anykeyStyle: Chalk;

  successStyle: Chalk;

  alertStyle: Chalk;

  errorStyle: Chalk;

  variableStyle: Chalk;

  constructor(
    prefix: string,
    anykeyStyle: Chalk,
    successStyle: Chalk,
    alertStyle: Chalk,
    errorStyle: Chalk,
    variableStyle: Chalk,
  ) {
    this.prefix = prefix;
    this.anykeyStyle = anykeyStyle;
    this.successStyle = successStyle;
    this.alertStyle = alertStyle;
    this.errorStyle = errorStyle;
    this.variableStyle = variableStyle;
  }

  // Message box styling.
  messageBox(
    msg: string,
    msgStyle: Chalk,
    title: string,
    emoji: string,
    msgBoxWidth = 46,
    variableStyle = this.variableStyle,
  ) {
    // Regex replace for text wrapping.
    const textWrapMsg = msg.replace(
      new RegExp(`(?![^\\n]{1,${msgBoxWidth}}$)([^\\n]{1,${msgBoxWidth}})\\s`, 'g'),
      '$1\n',
    );

    // Replace variables, surrounded by double quotes, by the stylized variable.
    const variableRegex = /"(.+)"/g;
    const varHighlightMsg = textWrapMsg.replace(
      variableRegex,
      variableStyle('$1'),
    );

    // Return stylized string inside of 'boxen' object for display in terminal.
    return msgStyle(boxen(
      varHighlightMsg,
      {
        title: chalk`{bold ${emoji} ${title}}`,
        titleAlignment: 'left',
        padding: 1,
        margin: 1,
      },
    ));
  }

  // await CLI.anykey(anykeyMsg) styling.
  async anykey(anykeyMsg = '') {
    await cli.anykey(`\n${this.prefix} ${this.anykeyStyle(`${anykeyMsg}`)}`);
  }

  // CLI.success(successMsg) styling.
  success(successMsg = '', title = '', emoji = '✅') {
    cli.log(this.messageBox(successMsg, this.successStyle, title, emoji));
  }

  // CLI.error(errorMsg) styling.
  error(errorMsg = '', title = '', emoji = '🚨') {
    cli.log(this.messageBox(errorMsg, this.errorStyle, title, emoji, 46, chalk.green));
    process.exit();
  }

  // CLI.alert(alertMsg, title, maxWidth) styling
  alert(alertMsg = '', title = '', emoji = '👋') {
    cli.log(this.messageBox(alertMsg, this.alertStyle, title, emoji));
  }

  // CLI.nodeVersionCheck() styling.
  nodeVersionCheck() {
    if (!semver.satisfies(process.version, '^16')) {
      this.error(
        dedent`
          WasmKnife requires "Node version 16"!\n
          Please switch your version of Node before running WasmKnife commands.\n
          If you are utilizing nvm, simply utilize the following command:\n
          "nvm use 16"
        `,
        'Incompatible Node Version',
        '🚨',
      );
      process.exit();
    }
  }
}

export default new CLI(
  '👉',
  chalk.cyan,
  chalk.green,
  chalk.blue,
  chalk.yellow,
  chalk.yellow,
);
