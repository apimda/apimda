import {
  AppMetadata,
  ControllerMetadata,
  InputLocation,
  InputMetadata,
  OutputMetadata,
  RouteMetadata
} from './metadata';
import { groupBy } from './utils';

type MetadataType = AppMetadata | ControllerMetadata | RouteMetadata | InputMetadata | OutputMetadata;

export enum ViolationCode {
  APP_DUPLICATE_ROUTES,
  CLR_INVALID_BASE_PATH,
  RT_INVALID_LOCAL_PATH,
  RT_ONLY_ONE_BODY_ALLOWED,
  RT_MISSING_PATH_VAR,
  RT_DUPLICATE_PATH_VAR,
  IN_BUFFER_NOT_SUPPORTED,
  IN_MIME_NOT_SUPPORTED,
  IN_GENERIC_NOT_SUPPORTED,
  IN_UNION_NOT_SUPPORTED,
  IN_OPTIONAL_NOT_SUPPORTED,
  OUT_BUFFER_NO_MIME,
  OUT_MIME_NOT_SUPPORTED,
  OUT_UNDEFINED_NOT_SUPPORTED,
  OUT_GENERIC_NOT_SUPPORTED,
  OUT_UNION_NOT_SUPPORTED
}

export class Violation {
  public sources: MetadataType[];

  constructor(public message: string, public code: ViolationCode, ...sources: MetadataType[]) {
    this.sources = sources;
  }
}

export class ValidationResult {
  constructor(public violations: Violation[]) {}

  get isValid(): boolean {
    return this.violations.length === 0;
  }

  get errorMessage(): string | undefined {
    if (!this.isValid) {
      const messages = this.violations.map(v => v.message);
      return messages.join('\n');
    }
  }

  violationsForMetadata(metadata: MetadataType): Violation[] {
    return this.violations.filter(v => v.sources.find(s => s === metadata) !== undefined);
  }
}

export function validateMetadata(metadata: AppMetadata): ValidationResult {
  const errors: Violation[] = [];

  const routes = metadata.controllers.flatMap(c => c.routes);
  const routesByPath = groupBy(routes, r => r.method.toUpperCase() + ' ' + r.pathInfo.normalizedPath);
  for (const path in routesByPath) {
    const routes = routesByPath[path];
    if (routes.length > 1) {
      const routesStr = routes.map(r => r.controller.className + '.' + r.classMethodName).join(', ');
      errors.push(
        new Violation(
          `Duplicate HTTP method/path: ${path} for routes: ${routesStr}`,
          ViolationCode.APP_DUPLICATE_ROUTES,
          ...routes
        )
      );
    }
  }

  for (const controller of metadata.controllers) {
    validateController(controller, errors);
  }
  return new ValidationResult(errors);
}

function validateController(controller: ControllerMetadata, errors: Violation[]) {
  function err(msg: string, code: ViolationCode) {
    errors.push(new Violation(`Error in controller: ${controller.className}: ${msg}`, code, controller));
  }

  if (isInvalidPath(controller.basePath)) {
    err(
      `Illegal base path '${controller.basePath}': value must start and not end with '/'`,
      ViolationCode.CLR_INVALID_BASE_PATH
    );
  }
  for (const route of controller.routes) {
    validateRoute(route, errors);
  }
}

function isInvalidPath(path: string): boolean {
  return path !== '' && (!path.startsWith('/') || path.endsWith('/'));
}

function validateRoute(route: RouteMetadata, errors: Violation[]) {
  function err(msg: string, code: ViolationCode) {
    errors.push(
      new Violation(`Error in method: ${route.controller.className}.${route.classMethodName}: ${msg}`, code, route)
    );
  }

  if (isInvalidPath(route.localPath)) {
    err(
      `Illegal route path '${route.localPath}': value must start and not end with '/'`,
      ViolationCode.RT_INVALID_LOCAL_PATH
    );
  }

  const bodyCnt = route.inputs.filter(i => i.location === InputLocation.Body).length;
  if (bodyCnt > 1) {
    err(`Only one @Body parameter allowed per method; found ${bodyCnt}`, ViolationCode.RT_ONLY_ONE_BODY_ALLOWED);
  }

  const pathVars = route.pathInfo.pathVars;
  for (const pathVar of pathVars) {
    if (!route.inputs.find(i => i.name === pathVar)) {
      err(`Could not find path variable for ${pathVar}`, ViolationCode.RT_MISSING_PATH_VAR);
    }
  }

  const uniquePathVars = new Set<string>(pathVars);
  if (uniquePathVars.size !== pathVars.length) {
    err(`Duplicate path variable found in route path: ${route.path}`, ViolationCode.RT_DUPLICATE_PATH_VAR);
  }

  for (const input of route.inputs) {
    validateInput(input, errors);
  }
  for (const output of route.outputs) {
    validateOutput(output, errors);
  }
}

function validateInput(input: InputMetadata, errors: Violation[]) {
  function err(msg: string, code: ViolationCode) {
    const r = input.route;
    const message = `Error in parameter: ${input.declaredArgName} in method: ${r.controller.className}.${r.classMethodName}: ${msg}`;
    errors.push(new Violation(message, code, input));
  }

  if (input.declaredTypeName === 'Buffer' && input.location !== InputLocation.Body) {
    err(`'Buffer' is only supported in @Body parameters`, ViolationCode.IN_BUFFER_NOT_SUPPORTED);
  }

  if (
    input.location === InputLocation.Body &&
    input.mimeType !== undefined &&
    input.declaredTypeName !== 'Buffer' &&
    input.declaredTypeName !== 'string'
  ) {
    err(
      `@Body parameter with custom MIME type can only be declared a 'string' of 'Buffer'`,
      ViolationCode.IN_MIME_NOT_SUPPORTED
    );
  }

  if (input.declaredTypeName?.indexOf('<') !== -1 || input.declaredTypeName?.indexOf('[') !== -1) {
    err(`Generic parameter type: '${input.declaredTypeName}' is not allowed`, ViolationCode.IN_GENERIC_NOT_SUPPORTED);
  }

  if (input.declaredTypeName?.indexOf('|') !== -1) {
    err(`Union parameter type: '${input.declaredTypeName}' is not allowed`, ViolationCode.IN_UNION_NOT_SUPPORTED);
  }

  if (!input.required && input.location !== InputLocation.Query && input.location !== InputLocation.Header) {
    err(`Optional parameters are only allowed with @Query and @Header`, ViolationCode.IN_OPTIONAL_NOT_SUPPORTED);
  }
}

function validateOutput(output: OutputMetadata, errors: Violation[]) {
  function err(msg: string, code: ViolationCode) {
    errors.push(
      new Violation(
        `Error in return type for method: ${output.route.controller.className}.${output.route.classMethodName}: ${msg}`,
        code,
        output
      )
    );
  }

  if (output.declaredTypeName === 'Buffer' && output.mimeType === undefined) {
    err(
      "'Buffer' is only supported as a return type if you specify a custom MIME type with @Produces",
      ViolationCode.OUT_BUFFER_NO_MIME
    );
  }

  if (output.mimeType !== undefined && output.declaredTypeName !== 'Buffer' && output.declaredTypeName !== 'string') {
    err(
      `@Produces can only be used if method returns 'string' or 'Buffer', found: ${output.declaredTypeName}`,
      ViolationCode.OUT_MIME_NOT_SUPPORTED
    );
  }

  if (output.declaredTypeName === 'undefined') {
    err('Undefined return type is not allowed', ViolationCode.OUT_UNDEFINED_NOT_SUPPORTED);
  }

  if (output.declaredTypeName) {
    if (
      output.declaredTypeName.indexOf('<') !== -1 &&
      !output.declaredTypeName.startsWith('Set<') &&
      !output.declaredTypeName.startsWith('Array<')
    ) {
      err(`Generic type: '${output.declaredTypeName}' not allowed`, ViolationCode.OUT_GENERIC_NOT_SUPPORTED);
    }

    if (output.declaredTypeName.indexOf('|') !== -1) {
      err(`Union type: '${output.declaredTypeName}' not allowed`, ViolationCode.OUT_UNION_NOT_SUPPORTED);
    }
  }
}
