import { OpenAPIV3_1 as OAPI } from 'openapi-types';
import { ApimdaConfig } from './config';
import { AppMetadata } from './metadata';
import { OpenApiGenerator } from './openapi';

const config: ApimdaConfig = {
  openApi: {
    info: {
      title: 'Sample Users App',
      summary: 'A user manager.',
      description: 'This is a sample server for a user store.',
      termsOfService: 'https://example.com/terms/',
      contact: {
        name: 'API Support',
        url: 'https://www.example.com/support',
        email: 'support@example.com'
      },
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
      },
      version: '1.0.1'
    },
    components: {
      securitySchemes: {
        userSecurityScheme: {
          type: 'oauth2',
          flows: {
            implicit: {
              authorizationUrl: 'https://example.org/api/oauth/dialog',
              scopes: {
                'write:users': 'modify users in your account',
                'read:users': 'read your users'
              }
            }
          }
        }
      }
    },
    paths: {
      '/users': {
        get: {
          security: [{ userSecurityScheme: ['read:users'] }]
        },
        post: {
          security: [{ userSecurityScheme: ['write:users'] }]
        }
      }
    },
    servers: [
      {
        url: 'https://development.gigantic-server.com/v1',
        description: 'Development server'
      },
      {
        url: 'https://staging.gigantic-server.com/v1',
        description: 'Staging server'
      }
    ],
    security: [
      {
        user_auth: ['write:users', 'read:users']
      }
    ]
  }
};
let metadata: AppMetadata;
let doc: OAPI.Document;

beforeAll(() => {
  metadata = AppMetadata.fromTsConfig(require.resolve('@apimda/samples-user-api/tsconfig.json'));
  doc = new OpenApiGenerator(metadata, config).generate();
});

test('open api version and config', () => {
  expect(doc.openapi).toBe('3.1.0');
  expect(doc.info).toStrictEqual(config.openApi!.info);
  expect(doc.servers).toStrictEqual(config.openApi!.servers);
  expect(doc.security).toStrictEqual(config.openApi!.security);
  expect(doc!.components!.securitySchemes!['mySecurityScheme']).toStrictEqual(
    config.openApi!.components!.securitySchemes!['mySecurityScheme']
  );
});

test('paths', () => {
  expect(doc.paths).toBeDefined();
  expect(Object.keys(doc.paths!)).toHaveLength(2);

  function verify(op: OAPI.OperationObject, hasRequestBody: boolean, paramCnt: number, responses: string[]) {
    expect(op.tags).toStrictEqual(['users']);
    expect(op.summary).toBeDefined();
    expect(op.description).toBeDefined();
    expect(op.operationId).toBeDefined();
    expect(op.parameters).toHaveLength(paramCnt);
    expect(op.requestBody !== undefined).toBe(hasRequestBody);
    const responseKeys = Object.keys(op.responses!);
    expect(responseKeys).toHaveLength(responses.length);
    responses.forEach(r => expect(responseKeys).toContain(r));
  }

  const userPath = doc.paths!['/users']!;
  expect(userPath).toBeDefined();
  expect(Object.keys(userPath)).toHaveLength(2);

  // fully verify GET /user tags, summary, description, operationId, parameters, responses
  const userGet = userPath['get']!;
  expect(userGet.tags).toStrictEqual(['users']);
  expect(userGet.summary).toBe('Get all users');
  expect(userGet.description).toBe('Get all users in the system, with optional filter by user type');
  expect(userGet.operationId).toBe('UserController_getUsers');
  expect(userGet.parameters).toHaveLength(1);
  expect(userGet.parameters![0]).toStrictEqual({
    name: 'userType',
    in: 'query',
    required: false,
    schema: {
      $ref: '#/components/schemas/UserType'
    },
    description: 'optional type of user to return'
  });
  expect(userGet.responses).toStrictEqual({
    '200': {
      description: 'array of all users, filtered by user type if specified',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/User'
            }
          }
        }
      }
    },
    '400': {
      description: 'Bad Request'
    }
  });
  expect(userGet.security).toStrictEqual([{ userSecurityScheme: ['read:users'] }]);

  // fully verify POST /user requestBody
  const userPost = userPath['post']!;
  expect(userPost.requestBody).toStrictEqual({
    description: 'user to create',
    required: true,
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/UserPost'
        }
      }
    }
  });
  expect(userPost.security).toStrictEqual([{ userSecurityScheme: ['write:users'] }]);
  verify(userPost, true, 0, ['200', '400']);

  const userIdPath = doc.paths!['/users/{userId}']!;
  expect(userIdPath).toBeDefined();
  expect(Object.keys(userIdPath)).toHaveLength(4);
  const userIdPathResponseCodes = ['200', '400', '404'];
  verify(userIdPath['get']!, false, 1, userIdPathResponseCodes);
  verify(userIdPath['put']!, true, 1, userIdPathResponseCodes);
  verify(userIdPath['patch']!, true, 1, userIdPathResponseCodes);
  verify(userIdPath['delete']!, false, 1, userIdPathResponseCodes);
});

test('components/schemas', () => {
  expect(doc.components).toBeDefined();
  expect(doc.components!.schemas).toBeDefined();
  // schemas are JSON schemas in v3.1 (or are supposed to be)
  // ensure all schemas are present, but don't verify details (see schema.test.ts for schema tests)
  const schemas = doc.components!.schemas!;
  expect(Object.keys(schemas)).toHaveLength(6);
  expect(Object.keys(schemas)).toContain('UserType');
  expect(Object.keys(schemas)).toContain('User');
  expect(Object.keys(schemas)).toContain('UUID');
  expect(Object.keys(schemas)).toContain('UserPost');
  expect(Object.keys(schemas)).toContain('UserPut');
  expect(Object.keys(schemas)).toContain('UserPatch');
});

test('tags', () => {
  expect(doc.tags).toBeDefined();
  expect(doc.tags).toHaveLength(1);
  const userTag = doc.tags![0];
  expect(userTag.name).toBe('users');
});
