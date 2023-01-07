import { Command } from 'commander';
import * as fs from 'fs';
import path from 'path';
import { AppMetadata } from './metadata';
import { OpenApiGenerator } from './openapi';
import { getTsConfig } from './utils';

const program = new Command();

program.name('apimda').description('CLI to some JavaScript string utilities').version('0.8.0');

program
  .command('api')
  .description('Generate OpenAPI 3.1 spec in JSON')
  .argument('<string>', 'path to tsconfig.json')
  .option('-c, --config <string>', 'path to apimda.config.js; defaults to dir of tsconfig file')
  .option('-o, --out <string>', 'path to save OpenAPI file', './openapi.json')
  .action((tsConfigArg: string, options: any) => {
    const tsConfigPath = getTsConfig(tsConfigArg);
    console.log(`Using tsconfig: ${tsConfigPath}`);

    const apimdaConfOpt = options.config;
    const apimdaConfigPath = apimdaConfOpt
      ? require.resolve(apimdaConfOpt)
      : path.join(path.dirname(tsConfigPath), 'apimda.config.js');
    let apimdaConfig = undefined;
    if (fs.existsSync(apimdaConfigPath)) {
      apimdaConfig = require(apimdaConfigPath);
      console.log(`Using apimda config: ${apimdaConfigPath}`);
    }

    const outPath = path.resolve(options.out || './openapi.json');

    const app = AppMetadata.fromTsConfig(tsConfigPath);
    const api = new OpenApiGenerator(app, apimdaConfig).generate();
    fs.writeFileSync(outPath, JSON.stringify(api, undefined, 2));
    console.log(`Generated OpenAPI JSON spec at: ${outPath}`);
  });

program
  .command('validate')
  .description('Validate controllers')
  .argument('<string>', 'path to tsconfig.json')
  .action((tsConfigArg: string, options: any) => {
    const tsConfigPath = getTsConfig(tsConfigArg);
    AppMetadata.fromTsConfig(tsConfigPath);
  });

program.parse();
