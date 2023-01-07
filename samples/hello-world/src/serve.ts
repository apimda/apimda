import { AppMetadata } from '@apimda/devtime';
import { createRequestListener } from '@apimda/runtime-node';
import * as http from 'node:http';

console.log(`Compiling application...`);
const app = AppMetadata.fromTsConfig('tsconfig.json');
console.log(`Starting HTTP server...`);
const listener = createRequestListener(app.runtimeApp);
const server = http.createServer(listener);
const port = 8080;
server.listen(port);
console.log(`Started HTTP server on port ${port}`);
