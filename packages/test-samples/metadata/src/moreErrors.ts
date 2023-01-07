import { HttpError } from '@apimda/runtime';

export function methodNotAllowed() {
  throw new HttpError(405);
}

function newHttpError(code: 408 | 409) {
  return new HttpError(code);
}

export class MoreErrors {
  static notAcceptable() {
    return () => {
      throw new HttpError(406);
    };
  }

  proxyAuthRequired() {
    const err = new HttpError(407);
    if (err.statusCode) {
      throw err;
    }
  }

  requestTimeout() {
    throw newHttpError(408);
  }

  conflict() {
    const err = newHttpError(409);
    if (err) {
      throw err;
    }
  }
}
