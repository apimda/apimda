// controller

/**
 * Controller that handles HTTP requests.
 * @param basePath base request path; all method handler paths are prefixed with this
 * @constructor
 */
export function Controller(basePath?: string): Function {
  return () => {};
}

// methods

/**
 * Handles a GET request.
 * @param path request path
 * @constructor
 */
export function Get(path?: string): Function {
  return () => {};
}

/**
 * Handles a POST request.
 * @param path request path
 * @constructor
 */
export function Post(path?: string): Function {
  return () => {};
}

/**
 * Handles a PUT request
 * @param path request path
 * @constructor
 */
export function Put(path?: string): Function {
  return () => {};
}

/**
 * Handles a PATCH request.
 * @param path request path
 * @constructor
 */
export function Patch(path?: string): Function {
  return () => {};
}

/**
 * Handles a DELETE request.
 * @param path request path
 * @constructor
 */
export function Delete(path?: string): Function {
  return () => {};
}

// inputs

/**
 * Inject original API Gateway v2 event.  This will not be documented in Open API.
 * The parameter type must be a valid v2 event, e.g. 'APIGatewayProxyEventV2WithJWTAuthorizer'.
 * @constructor
 */
export function Request(): Function {
  return () => {};
}

/**
 * Inject request body.  Default MIME type is "application/json".
 * If custom MIME type is specified, the parameter type must be 'string' or 'Buffer'.
 * @param mimeType MIME content type of body
 * @constructor
 */
export function Body(mimeType?: string): Function {
  return () => {};
}

/**
 * Inject path parameter.
 * @param name name of parameter in path template, or undefined to use variable name
 * @constructor
 */
export function Path(name?: string): Function {
  return () => {};
}

/**
 * Inject query string parameter.
 * @param name name of query string parameter, or undefined to use variable name
 * @constructor
 */
export function Query(name?: string): Function {
  return () => {};
}

/**
 * Inject header value.
 * @param name name of header
 * @constructor
 */
export function Header(name: string): Function {
  return () => {};
}

/**
 * Inject cookie value.
 * @param name name of cookie
 * @constructor
 */
export function Cookie(name: string): Function {
  return () => {};
}

// Other

/**
 * Declare Content-Type MIME for response.
 * Only valid on methods that return 'string' or 'Buffer'.
 * Required for all methods that return 'Buffer'.
 *
 * @param mimeType
 * @constructor
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
 */
export function Produces(mimeType: string): Function {
  return () => {};
}

/**
 * Declares Open API tags to associate with the controller or route.
 * @param values tag values
 * @constructor
 */
export function Tags(...values: string[]): Function {
  return () => {};
}

/**
 * Mark member method of controller class as async initializer.  The method must take no arguments, and is invoked
 * directly after object construction.
 *
 * Note that if you use this, it will generate a top-level await in your lambda handler.  You'll need to specify
 * bundling options in NodejsFunctionProps that support this, e.g. in esbuild v0.14.54 use the ESM format instead of
 * the default, CJS.
 * @constructor
 */
export function Init(): Function {
  return () => {};
}

/**
 * Inject string value from lambda environment into controller constructor parameter.  This is typically used to pass
 * values generated in CDK to a controller, e.g. S3 bucket names, dynamo table names, etc.
 * @param name name of environment variable, e.g. MY_TABLE_NAME, to inject
 * @constructor
 */
export function Env(name: string): Function {
  return () => {};
}
