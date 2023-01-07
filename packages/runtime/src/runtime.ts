import addFormats from 'ajv-formats';
import Ajv, { ErrorObject } from 'ajv/dist/2020';
import { ApimdaResult } from './apimdaResult';
import { HttpError } from './httpError';

export interface RuntimeApp {
  controllers: RuntimeController[];
  schemas: Record<string, any>;
}

export interface RuntimeController {
  moduleName: string;
  className: string;
  ctorEnvNames: string[];
  initMethodName?: string;
  routes: RuntimeRoute[];
}

export interface RuntimeRoute {
  method: 'get' | 'put' | 'post' | 'patch' | 'delete';
  path: string;
  inputs: RuntimeInput[];
  successOutput: RuntimeOutput;
  classMethodName: string;
}

export interface RuntimeInput {
  name: string;
  location: 'request' | 'query' | 'path' | 'header' | 'cookie' | 'body';
  required?: boolean;
  schemaKey?: string;
  declaredTypeName: string;
}

export interface RuntimeOutput {
  statusCode: number;
  apimdaResult?: boolean;
  mimeType?: string;
  declaredTypeName?: string;
}

export type RuntimeResult = {
  statusCode: number;
  headers: Record<string, string | boolean | number>;
  cookies: Record<string, string | boolean | number>;
  body: string | Buffer;
  isBinary: boolean;
};

export interface InputExtractor<T> {
  extract(input: RuntimeInput): T | string | Buffer | undefined;
}

function successResult(out: RuntimeOutput, result: any): RuntimeResult {
  const customStatusCode = out.apimdaResult ? (result as ApimdaResult<any>).statusCode : undefined;
  const statusCode = customStatusCode ?? out.statusCode;

  const customHeaders = out.apimdaResult ? (result as ApimdaResult<any>).headers : undefined;
  const headers = customHeaders ?? {};
  if (out.mimeType) {
    headers['Content-Type'] = out.mimeType;
  }

  const customCookies = out.apimdaResult ? (result as ApimdaResult<any>).cookies : undefined;
  const cookies = customCookies ?? {};

  const bodyResult = out.apimdaResult ? (result as ApimdaResult<any>).result : result;
  const isBinary = out.declaredTypeName === 'Buffer';
  const isString = out.declaredTypeName === 'string';
  const body = isBinary ? (bodyResult as Buffer) : isString ? bodyResult : JSON.stringify(bodyResult);

  return {
    statusCode,
    headers,
    cookies,
    body,
    isBinary
  };
}

export class Validator {
  private readonly ajv: Ajv;

  constructor(schemas: Record<string, any>) {
    this.ajv = new Ajv({ allErrors: true });
    this.ajv.addKeyword('example');
    addFormats(this.ajv);

    for (const key in schemas) {
      this.ajv.addSchema(schemas[key], key);
    }
  }

  private static createMessage(input: RuntimeInput, errors: ErrorObject[]): string {
    return errors
      .flatMap(e => {
        const baseMsg = `Error validating parameter ${input.name} with schema ${e.schemaPath}`;
        if (e.message) {
          if (e.propertyName) {
            return [`${baseMsg} property:${e.propertyName}: ${e.message}`];
          }
          return [`${baseMsg}: ${e.message}`];
        }
        return [];
      })
      .join('\n');
  }

  /**
   * Validates an input
   * @param input runtime metadata for input
   * @param value value extracted from request
   * @returns properly typed value for input or throws error
   */
  public validate(input: RuntimeInput, value: any): any {
    if (value === undefined) {
      if (input.required) {
        throw new HttpError(400, `Required input ${input.name} not provided`);
      } else {
        return value;
      }
    }

    if (input.location === 'request' || input.declaredTypeName === 'string' || input.declaredTypeName === 'Buffer') {
      return value;
    }

    if (input.declaredTypeName === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        throw new HttpError(400, `Error parsing ${input.name} as number from '${value}'`);
      } else {
        return num;
      }
    }

    if (input.declaredTypeName === 'boolean') {
      if (value === 'true') {
        return true;
      } else if (value === 'false') {
        return false;
      } else {
        throw new HttpError(400, `Error parsing ${input.name} as boolean from '${value}'`);
      }
    }

    return this.validateWithSchema(input, value);
  }

  /**
   * Validates a (non-primitive) value using a schema.
   * @param input
   * @param value
   * @private
   */
  private validateWithSchema<T>(input: RuntimeInput, value: any): T {
    if (!input.schemaKey) {
      throw new Error(`No schema found for input: ${input.name}`);
    }

    const validateFn = this.ajv.getSchema<T>(input.schemaKey);
    if (!validateFn) {
      throw new Error(`Can't find schema for key: ${input.schemaKey}`);
    }

    if (validateFn(value)) {
      return value;
    } else {
      const errors = validateFn.errors;
      const message = errors?.length ? Validator.createMessage(input, errors) : 'Validation Error';
      throw new HttpError(400, message);
    }
  }
}

export async function processRequest<T>(
  inputExtractor: InputExtractor<T>,
  route: RuntimeRoute,
  controllerInstance: any,
  validator: Validator
): Promise<RuntimeResult> {
  try {
    const args = route.inputs.map(input => validator.validate(input, inputExtractor.extract(input)));
    const result = await (controllerInstance[route.classMethodName] as Function).apply(controllerInstance, args);
    return successResult(route.successOutput, result);
  } catch (e) {
    if (e instanceof HttpError) {
      return {
        statusCode: e.statusCode,
        headers: {},
        cookies: {},
        body: e.message,
        isBinary: false
      };
    } else {
      throw e;
    }
  }
}
