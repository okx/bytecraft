// import { generate, readSchemas } from 'cosmwasm-typescript-gen';
//
// export default async (name: string, schemaDir: string, out: string) => {
//   const schemas = readSchemas({ schemaDir, argv: {} });
//   await generate(name, schemas, out);
// };

import { generateClient, generateTypes, readSchemas } from '@cosmwasm/ts-codegen';
import { execSync } from 'child_process';

export default async (name: string, schemaDir: string, out: string) => {
  // const schemas = await readSchemas({ schemaDir });
  // await generateTypes(name, schemas, out, {});
  //
  // await generateClient(name, schemas, out, {});

  execSync(`cosmwasm-ts-codegen generate --plugin client --schema ${schemaDir} --out ${out} --name ${name} --no-bundle`);
};
