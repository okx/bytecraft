import { existsSync } from 'fs';
import * as path from 'path';
import CLI from '../CLI';

async function runCommand(execPath: string, command: () => void, errorCheck: () => void) {
  // Initialize appRootPath directory to current working directory.
  let appRootPath = process.cwd();

  // Backtrack, up to 4 times, through file tree to find execPath.
  for (let stepBack = 0; stepBack < 5; stepBack += 1) {
    // User specified error check to execute upon each iteration.
    // eslint-disable-next-line no-await-in-loop
    await errorCheck();

    // If execPath available, execute command.
    if (existsSync(execPath)) {
      return command();
    }

    // If execPath does not exist in current directory, step back one directory.
    appRootPath = path.join(appRootPath, '..');
    process.chdir(appRootPath);
  }

  // If appRootPath not found after stepping back 4 directories,
  // tell user to run command in a wasmknife project directory.
  return CLI.error(
    `Command execution path "${execPath}" not found. Please ensure that you are in a wasmknife project directory.`,
    'Execution Path Not Found',
  );
}

export default runCommand;
