import { HttpError, InputExtractor, RuntimeInput } from '@apimda/runtime';
import { IncomingMessage } from 'node:http';

export class NodeRequestExtractor implements InputExtractor<IncomingMessage> {
  constructor(
    private readonly request: IncomingMessage,
    private readonly url: URL,
    private readonly pathParameters: Record<string, string>,
    private readonly body: Buffer | string | undefined
  ) {}

  extract(input: RuntimeInput): string | Buffer | IncomingMessage | undefined {
    switch (input.location) {
      case 'request':
        return this.request;
      case 'query':
        const params = this.url.searchParams.getAll(input.name);
        if (params.length > 1) {
          throw new HttpError(400, `Multi value query params '${input.name}' not supported`);
        }
        return params.length ? params[0] : undefined;
      case 'path':
        return this.pathParameters[input.name];
      case 'header':
        const header = this.request.headers[input.name.toLowerCase()];
        if (Array.isArray(header)) {
          throw new HttpError(400, `Multi value header '${input.name}' not supported`);
        }
        return header;
      case 'cookie':
        if (this.request.headers.cookie) {
          const cookies = this.request.headers.cookie.split(';');
          for (const cookie of cookies) {
            const eqIdx = cookie.indexOf('=');
            if (eqIdx > 0) {
              const name = cookie.substring(0, eqIdx);
              const value = cookie.substring(eqIdx + 1);
              if (input.name === name) {
                return value;
              }
            }
          }
        }
        return undefined;
      case 'body':
        if (!this.body) {
          return undefined;
        }
        if (input.declaredTypeName === 'string' || input.declaredTypeName === 'Buffer') {
          return this.body;
        }
        return JSON.parse(this.body as string);
      default:
        throw new Error(`Unsupported param type: ${input.location}`);
    }
  }
}
