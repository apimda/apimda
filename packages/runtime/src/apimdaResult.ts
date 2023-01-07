import { HttpRedirectStatusCode, HttpSuccessStatusCode } from './httpStatusCode';

/**
 * Result of type T, allowing customization of status code, headers, and cookies.
 */
export type ApimdaResult<T> = {
  statusCode?: HttpSuccessStatusCode | HttpRedirectStatusCode;
  headers?: Record<string, string | boolean | number>;
  cookies?: Record<string, string | boolean | number>;
  result: T;
};
