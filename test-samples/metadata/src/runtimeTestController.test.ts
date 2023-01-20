import { AppMetadata } from '@apimda/devtime';
import { createAwsLambdaHandler } from '@apimda/runtime-lambda';
import {
  APIGatewayProxyEventV2 as Event,
  APIGatewayProxyStructuredResultV2 as Result
} from 'aws-lambda/trigger/api-gateway-proxy';
import { randomUUID } from 'crypto';
import { RuntimeTestController } from './runtimeTestController';

let app: AppMetadata;
let handler: (event: Event) => Promise<Result>;

const createEvent = <T extends Pick<Event, 'routeKey'> & Partial<Event>>(props: T): Event => {
  return {
    version: '',
    isBase64Encoded: false,
    rawPath: '',
    rawQueryString: '',
    headers: {},
    requestContext: {} as any,
    ...props
  };
};

beforeAll(() => {
  app = AppMetadata.fromTsConfig(require.resolve('@apimda/test-samples-metadata/tsconfig.json'));
  const controller = app.controllers.find(c => c.className === 'RuntimeTestController');
  handler = createAwsLambdaHandler(controller!.runtimeApp, new RuntimeTestController());
});

describe('Async initializer test', () => {
  test('init method invoked', async () => {
    const routeKey = 'GET /testInitMethod';
    const event = createEvent({ routeKey });
    expect((await handler(event))['body']).toBe('true');
  });
});

describe('Parameter tests', () => {
  test('optional query param', async () => {
    const routeKey = 'GET /testOptionalQuery';

    const yesEvent = createEvent({ queryStringParameters: { id: randomUUID() }, routeKey });
    expect((await handler(yesEvent))['body']).toBe('yes');

    const noEvent = createEvent({ routeKey });
    expect((await handler(noEvent))['body']).toBe('no');
  });
});

describe('body validation tests', () => {
  test('valid body works as expected', async () => {
    const emailObj = { email: 'joe@test.com' };
    const event = createEvent({
      body: JSON.stringify(emailObj),
      routeKey: 'POST /testBodyValidation'
    });
    const result = JSON.parse((await handler(event))['body']!);
    expect(result).toStrictEqual(emailObj);
  });

  test('valid empty body works as expected', async () => {
    const event = createEvent({
      body: '{}',
      routeKey: 'POST /testBodyValidation'
    });
    const result = JSON.parse((await handler(event))['body']!);
    expect(result).toStrictEqual({});
  });

  test('invalid body returns 400', async () => {
    const event = createEvent({
      email: 'invalid email',
      routeKey: 'POST /testBodyValidation'
    });
    const { statusCode } = await handler(event);
    expect(statusCode).toBe(400);
  });
});

describe('Buffer tests', () => {
  test('buffer in/out works as expected', async () => {
    const dataStr = 'some data';
    const event = createEvent({
      routeKey: 'POST /testBinaryHandling',
      body: Buffer.from(dataStr).toString('base64'),
      isBase64Encoded: true
    });
    const result = await handler(event);
    expect(result.isBase64Encoded).toBe(true);
    expect(result.headers!['Content-Type']).toBe('application/octet-stream');
    expect(Buffer.from(result.body!, 'base64').toString()).toBe(dataStr);
  });
});

describe('ApimdaResult tests', () => {
  test('ApimdaResult with JSON', async () => {
    const result = await handler(createEvent({ routeKey: 'GET /apimdaResult' }));
    expect(result.isBase64Encoded).toBeFalsy();
    expect(result.statusCode).toBe(RuntimeTestController.apimdaResult.statusCode);
    expect(result.headers).toBe(RuntimeTestController.apimdaResult.headers);
    expect(result.cookies).toStrictEqual(['cookie1=value1', 'cookie2=value2']);
    expect(result.body).toStrictEqual(JSON.stringify(RuntimeTestController.apimdaResult.result));
  });

  test('ApimdaResult with Buffer', async () => {
    const result = await handler(createEvent({ routeKey: 'GET /apimdaResultWithBuffer' }));
    expect(result.isBase64Encoded).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.headers).toStrictEqual({
      ...RuntimeTestController.apimdaResultWithBuffer.headers,
      'Content-Type': 'application/octet-stream'
    });
    expect(result.cookies).toHaveLength(0);
    expect(Buffer.from(result.body!, 'base64')).toStrictEqual(RuntimeTestController.apimdaResultWithBuffer.result);
  });
});

describe('GenericResult tests', () => {
  test('Simple generic result', async () => {
    const result = await handler(createEvent({ routeKey: 'GET /genericResult' }));
    expect(result.body).toStrictEqual(JSON.stringify(RuntimeTestController.genericResultValue));
  });
});
