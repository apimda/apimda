import { AppMetadata, InputLocation, RouteMethod } from './metadata';

let app: AppMetadata;

beforeAll(() => {
  app = AppMetadata.fromTsConfig(require.resolve('@apimda/test-samples-metadata/tsconfig.json'), false);
});

test('find all controllers in project', () => {
  expect(app.controllers.length).toBe(4);
});

describe('built in types for inputs/outputs', () => {
  test('raw APIGW event/result', () => {
    const input = app.findInput('BuiltinController', 'raw', 'event')!;
    expect(input.location).toBe(InputLocation.Request);
    expect(input.required).toBe(true);
    expect(input.mimeType).toBeUndefined();
    expect(input.declaredTypeName).toBe('Event');
    expect(input.name).toBe(input.declaredArgName);

    const output = app.findSuccessOutput('BuiltinController', 'raw')!;
    expect(output.declaredTypeName).toBeUndefined();
    expect(output.mimeType).toBeUndefined();
  });

  test('primitive types', () => {
    for (const primitive of ['string', 'number', 'boolean']) {
      const classMethodName = `${primitive}Primitive`;
      const input = app.findInput('BuiltinController', classMethodName, 'param')!;
      expect(input.location).toBe(InputLocation.Query);
      expect(input.required).toBe(true);
      expect(input.mimeType).toBeUndefined();
      expect(input.declaredTypeName).toBe(primitive);
      expect(input.name).toBe(input.declaredArgName);

      const output = app.findSuccessOutput('BuiltinController', classMethodName)!;
      expect(output.declaredTypeName).toBe(primitive);
      expect(output.mimeType).toBeUndefined();
    }
  });

  test('optional param and void return', () => {
    const input = app.findInput('BuiltinController', 'optionalAndVoid', 'param')!;
    expect(input.location).toBe(InputLocation.Query);
    expect(input.required).toBe(false);
    expect(input.mimeType).toBeUndefined();
    expect(input.declaredTypeName).toBe('string');
    expect(input.name).toBe(input.declaredArgName);

    const output = app.findSuccessOutput('BuiltinController', 'optionalAndVoid')!;
    expect(output.declaredTypeName).toBeUndefined();
    expect(output.mimeType).toBeUndefined();
  });

  test('binary types', () => {
    const input = app.findInput('BuiltinController', 'binary', 'data')!;
    expect(input.location).toBe(InputLocation.Body);
    expect(input.required).toBe(true);
    expect(input.mimeType).toBe('image/png');
    expect(input.declaredTypeName).toBe('Buffer');
    expect(input.name).toBe(input.declaredArgName);

    const output = app.findSuccessOutput('BuiltinController', 'binary')!;
    expect(output.declaredTypeName).toBe('Buffer');
    expect(output.mimeType).toBe('image/png');
  });

  test('array types', () => {
    const output = app.findSuccessOutput('BuiltinController', 'arrays')!;
    expect(output.declaredTypeName).toBe('string[]');
    expect(output.mimeType).toBeUndefined();
  });

  test('date types', () => {
    const input = app.findInput('BuiltinController', 'dates', 'param')!;
    expect(input.location).toBe(InputLocation.Query);
    expect(input.required).toBe(true);
    expect(input.mimeType).toBeUndefined();
    expect(input.declaredTypeName).toBe('Date');
    expect(input.name).toBe(input.declaredArgName);

    const output = app.findSuccessOutput('BuiltinController', 'dates')!;
    expect(output.declaredTypeName).toBe('Date');
    expect(output.mimeType).toBeUndefined();
  });

  test('set types', () => {
    const output = app.findSuccessOutput('BuiltinController', 'sets')!;
    expect(output.declaredTypeName).toBe('Set<string>');
    expect(output.mimeType).toBeUndefined();
  });
});

describe('decorator parsing', () => {
  test('@Controller and @Tags', () => {
    const decoratorController = app.findController('DecoratorController')!;
    expect(decoratorController.basePath).toBe('/decorator');
    expect(decoratorController.tags).toHaveLength(2);
    expect(decoratorController.tags).toContain('decorator');
    expect(decoratorController.tags).toContain('controller');
  });

  test('@Env', () => {
    const decoratorController = app.findController('DecoratorController')!;
    expect(decoratorController.ctorEnvNames).toStrictEqual(['TABLE_NAME', 'BUCKET_NAME']);
  });

  test('@Init', () => {
    const decoratorController = app.findController('DecoratorController')!;
    expect(decoratorController.initMethodName).toBe('asyncInitializer');
  });

  test('@Get, @Post, @Put, @Patch, @Delete', () => {
    const verifyMethod = (classMethodName: string, httpMethod: RouteMethod, path: string = '/decorator') => {
      const route = app.findRoute('DecoratorController', classMethodName)!;
      expect(route.method).toBe(httpMethod);
      expect(route.path).toBe(path);
    };
    for (const httpMethod of Object.values(RouteMethod)) {
      verifyMethod(`${httpMethod}NoParam`, httpMethod);
      verifyMethod(`${httpMethod}WithParam`, httpMethod, '/decorator/path');
    }
  });

  test('@Body', () => {
    const verifyInput = (classMethodName: string, mimeType?: string) => {
      const input = app.findInput('DecoratorController', classMethodName, 'body')!;
      expect(input.location).toBe(InputLocation.Body);
      expect(input.name).toBe('body');
      expect(input.mimeType).toBe(mimeType);
    };
    verifyInput('bodyNoParam');
    verifyInput('bodyWithParam', 'text/plain');
  });

  test('@Query and @Path', () => {
    const verifyInput = (classMethodName: string, paramLocation: InputLocation, paramName: string = 'name') => {
      const input = app.findInput('DecoratorController', classMethodName, 'name')!;
      expect(input.location).toBe(paramLocation);
      expect(input.name).toBe(paramName);
    };
    for (const paramIn of [InputLocation.Query, InputLocation.Path]) {
      verifyInput(`${paramIn}NoParam`, paramIn);
      verifyInput(`${paramIn}WithParam`, paramIn, 'customName');
    }
  });

  test('@Header', () => {
    const input = app.findInput('DecoratorController', 'header', 'language')!;
    expect(input.location).toBe(InputLocation.Header);
    expect(input?.name).toBe('Accept-Language');
  });

  test('@Cookie', () => {
    const input = app.findInput('DecoratorController', 'cookie', 'c')!;
    expect(input.location).toBe(InputLocation.Cookie);
    expect(input?.name).toBe('cookieName');
  });

  test('@Produces', () => {
    const output = app.findSuccessOutput('DecoratorController', 'produces')!;
    expect(output.mimeType).toBe('text/html; charset=utf-8');
  });
});

describe('http error tests', () => {
  test('find all errors in weird places', () => {
    const route = app.findRoute('HttpErrorController', 'findAllTheErrors')!;
    expect(route.errorOutputs.map(o => o.statusCode).sort()).toStrictEqual([400, 401, 402, 403, 404, 405, 406]); // 407, 408, 409 are not supported yet
  });
});
