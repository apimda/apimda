import { AppMetadata } from './metadata';
import { validateMetadata, ValidationResult, ViolationCode } from './validation';

const controllerClassName = 'InvalidController';
let app: AppMetadata;
let validationResult: ValidationResult;

beforeAll(() => {
  app = AppMetadata.fromTsConfig(require.resolve('@apimda/test-samples-validation/tsconfig.json'), false, false);
  validationResult = validateMetadata(app);
});

test('metadata sample is valid', () => {
  const metadataTestApp = AppMetadata.fromTsConfig(
    require.resolve('@apimda/test-samples-metadata/tsconfig.json'),
    false
  );
  const metadataTestResult = validateMetadata(metadataTestApp);
  expect(metadataTestApp.controllers.length).toBe(4);
  expect(metadataTestResult.isValid).toBe(true);
});

test('user-api sample is valid', () => {
  const userApiApp = AppMetadata.fromTsConfig(require.resolve('@apimda/samples-user-api/tsconfig.json'), false);
  const userApiResult = validateMetadata(userApiApp);
  expect(userApiApp.controllers.length).toBe(1);
  expect(userApiResult.isValid).toBe(true);
});

test('found all controllers in project', () => {
  expect(app.controllers.length).toBe(1);
});

test('total violation count', () => {
  expect(validationResult.violations.length).toBe(19);
});

test('invalid controller base path', () => {
  const c = app.findController(controllerClassName)!;
  expect(c).toBeDefined();
  const err = validationResult.violationsForMetadata(c);
  expect(err.length).toBe(1);
  expect(err[0].code).toBe(ViolationCode.CLR_INVALID_BASE_PATH);
});

test('Duplicate routes in app', () => {
  const r1 = app.findRoute(controllerClassName, 'appDupRouteOne')!;
  const r2 = app.findRoute(controllerClassName, 'appDupRouteTwo')!;
  const r3 = app.findRoute(controllerClassName, 'appDupRouteThree')!;
  const err = validationResult.violationsForMetadata(r1);
  expect(err.length).toBe(1);
  expect(err[0].sources.length).toBe(3);
  expect(err[0].sources).toContain(r1);
  expect(err[0].sources).toContain(r2);
  expect(err[0].sources).toContain(r3);
});

function expectRtCode(classMethodName: string, code: ViolationCode) {
  const route = app.findRoute(controllerClassName, classMethodName)!;
  expect(route).toBeDefined();
  const err = validationResult.violationsForMetadata(route);
  expect(err.length).toBe(1);
  expect(err[0].code).toBe(code);
}

describe('Invalid Routes', () => {
  test('RT_INVALID_LOCAL_PATH (NoStartSlash)', () => {
    expectRtCode('rtInvalidNoStartSlash', ViolationCode.RT_INVALID_LOCAL_PATH);
  });

  test('RT_INVALID_LOCAL_PATH (HasEndSlash)', () => {
    expectRtCode('rtInvalidHasEndSlash', ViolationCode.RT_INVALID_LOCAL_PATH);
  });

  test('RT_ONLY_ONE_BODY_ALLOWED', () => {
    expectRtCode('rtOnlyOneBodyAllowed', ViolationCode.RT_ONLY_ONE_BODY_ALLOWED);
  });

  test('RT_MISSING_PATH_VAR (only one path var)', () => {
    expectRtCode('rtMissingPathVarOne', ViolationCode.RT_MISSING_PATH_VAR);
  });

  test('RT_MISSING_PATH_VAR (two path vars, one missing)', () => {
    expectRtCode('rtMissingPathVarTwo', ViolationCode.RT_MISSING_PATH_VAR);
  });

  test('RT_DUPLICATE_PATH_VAR', () => {
    expectRtCode('rtDuplicatePathVar', ViolationCode.RT_DUPLICATE_PATH_VAR);
  });
});

function expectInCode(declaredArgName: string, code: ViolationCode) {
  const input = app.findInput(controllerClassName, 'inputs', declaredArgName)!;
  expect(input).toBeDefined();
  const err = validationResult.violationsForMetadata(input);
  expect(err.length).toBe(1);
  expect(err[0].code).toBe(code);
}

describe('Invalid Inputs', () => {
  test('IN_BUFFER_NOT_SUPPORTED', () => {
    expectInCode('buffer', ViolationCode.IN_BUFFER_NOT_SUPPORTED);
  });

  test('IN_MIME_NOT_SUPPORTED', () => {
    expectInCode('mime', ViolationCode.IN_MIME_NOT_SUPPORTED);
  });

  test('IN_GENERIC_NOT_SUPPORTED', () => {
    expectInCode('array', ViolationCode.IN_GENERIC_NOT_SUPPORTED);
  });

  test('IN_GENERIC_NOT_SUPPORTED', () => {
    expectInCode('generic', ViolationCode.IN_GENERIC_NOT_SUPPORTED);
  });

  test('IN_UNION_NOT_SUPPORTED', () => {
    expectInCode('union', ViolationCode.IN_UNION_NOT_SUPPORTED);
  });

  test('IN_OPTIONAL_NOT_SUPPORTED', () => {
    expectInCode('optional', ViolationCode.IN_OPTIONAL_NOT_SUPPORTED);
  });
});

function expectOutCode(classMethodName: string, code: ViolationCode) {
  const output = app.findSuccessOutput(controllerClassName, classMethodName)!;
  expect(output).toBeDefined();
  const err = validationResult.violationsForMetadata(output);
  expect(err.length).toBe(1);
  expect(err[0].code).toBe(code);
}

describe('Invalid Outputs', () => {
  test('OUT_BUFFER_NO_MIME', () => {
    expectOutCode('outBufferNoMime', ViolationCode.OUT_BUFFER_NO_MIME);
  });

  test('OUT_MIME_NOT_SUPPORTED', () => {
    expectOutCode('outMimeNotSupported', ViolationCode.OUT_MIME_NOT_SUPPORTED);
  });

  test('OUT_UNDEFINED_NOT_SUPPORTED', () => {
    expectOutCode('outUndefinedNotSupported', ViolationCode.OUT_UNDEFINED_NOT_SUPPORTED);
  });

  test('OUT_GENERIC_NOT_SUPPORTED', () => {
    expectOutCode('outGenericNotSupported', ViolationCode.OUT_GENERIC_NOT_SUPPORTED);
  });

  test('OUT_UNION_NOT_SUPPORTED', () => {
    expectOutCode('outUnionNotSupported', ViolationCode.OUT_UNION_NOT_SUPPORTED);
  });
});
