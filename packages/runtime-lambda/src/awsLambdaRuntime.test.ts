import { RuntimeInput } from '@apimda/runtime';
import { LambdaExtractor } from './awsLambdaRuntime';

const sampleEvent = {
  version: '2.0',
  routeKey: '$default',
  rawPath: '/my/path',
  rawQueryString: 'parameter1=value1&parameter1=value2&parameter2=value',
  cookies: ['cookie1=value1', 'cookie2=val=ue2'],
  headers: {
    header1: 'value1',
    header2: 'value1,value2'
  },
  queryStringParameters: {
    parameter1: 'value1,value2',
    parameter2: 'value'
  },
  requestContext: {
    accountId: '123456789012',
    apiId: 'api-id',
    authentication: {
      clientCert: {
        clientCertPem: 'CERT_CONTENT',
        subjectDN: 'www.example.com',
        issuerDN: 'Example issuer',
        serialNumber: 'a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1',
        validity: {
          notBefore: 'May 28 12:30:02 2019 GMT',
          notAfter: 'Aug  5 09:36:04 2021 GMT'
        }
      }
    },
    authorizer: {
      jwt: {
        claims: {
          claim1: 'value1',
          claim2: 'value2'
        },
        scopes: ['scope1', 'scope2']
      }
    },
    domainName: 'id.execute-api.us-east-1.amazonaws.com',
    domainPrefix: 'id',
    http: {
      method: 'POST',
      path: '/my/path',
      protocol: 'HTTP/1.1',
      sourceIp: 'IP',
      userAgent: 'agent'
    },
    requestId: 'id',
    routeKey: '$default',
    stage: '$default',
    time: '12/Mar/2020:19:03:58 +0000',
    timeEpoch: 1583348638390
  },
  body: 'Hello from Lambda',
  pathParameters: {
    parameter1: 'value1'
  },
  isBase64Encoded: false,
  stageVariables: {
    stageVariable1: 'value1',
    stageVariable2: 'value2'
  }
};

const base64Event = {
  ...sampleEvent,
  isBase64Encoded: true,
  body: 'SGVsbG8gZnJvbSBiaW5hcnkgTGFtYmRh'
};

const ext = new LambdaExtractor(sampleEvent);

describe('input extraction tests', () => {
  test('request', () => {
    const input: RuntimeInput = { name: 'name', location: 'request', required: true, declaredTypeName: 'Event' };
    expect(ext.extract(input)).toBe(sampleEvent);
  });

  test('query', () => {
    let input: RuntimeInput = { name: 'parameter1', location: 'query', declaredTypeName: 'string' };
    expect(ext.extract(input)).toBe('value1,value2');

    input = { name: 'parameter2', location: 'query', declaredTypeName: 'string' };
    expect(ext.extract(input)).toBe('value');

    input = { name: 'parameter3', location: 'query', declaredTypeName: 'string' };
    expect(ext.extract(input)).toBeUndefined();
  });

  test('path', () => {
    let input: RuntimeInput = { name: 'parameter1', location: 'path', declaredTypeName: 'string' };
    expect(ext.extract(input)).toBe('value1');

    input = { name: 'parameter2', location: 'path', declaredTypeName: 'string' };
    expect(ext.extract(input)).toBeUndefined();
  });

  test('header', () => {
    let input: RuntimeInput = { name: 'header1', location: 'header', declaredTypeName: 'string' };
    expect(ext.extract(input)).toBe('value1');

    input = { name: 'header2', location: 'header', declaredTypeName: 'string' };
    expect(ext.extract(input)).toBe('value1,value2');

    input = { name: 'header3', location: 'header', declaredTypeName: 'string' };
    expect(ext.extract(input)).toBeUndefined();
  });

  test('cookie', () => {
    let input: RuntimeInput = { name: 'cookie1', location: 'cookie', declaredTypeName: 'string' };
    expect(ext.extract(input)).toBe('value1');

    input = { name: 'cookie2', location: 'cookie', declaredTypeName: 'string' };
    expect(ext.extract(input)).toBe('val=ue2');

    input = { name: 'cookie3', location: 'cookie', declaredTypeName: 'string' };
    expect(ext.extract(input)).toBeUndefined();
  });

  test('body (string)', () => {
    let input: RuntimeInput = { name: 'b', location: 'body', declaredTypeName: 'string' };
    expect(ext.extract(input)).toBe('Hello from Lambda');
  });

  test('body (base64)', () => {
    const binExt = new LambdaExtractor(base64Event);
    let input: RuntimeInput = { name: 'b', location: 'body', declaredTypeName: 'Buffer' };
    const buffer = binExt.extract(input) as Buffer;
    expect(buffer.toString()).toBe('Hello from binary Lambda');
  });
});
