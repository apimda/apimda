import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { ApimdaApp } from './apimdaApp';

describe('ApimdaApp', () => {
  test('creates correct lambda functions for each controller', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'ApimdaStack');
    const tsConfig = require.resolve('@apimda/test-samples-metadata/tsconfig.json');
    const apimdaApp = new ApimdaApp(stack, 'ApimdaApp', {
      tsConfigPath: tsConfig,
      lambdaProps: {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_16_X,
        bundling: {
          target: 'node16'
        },
        environment: {
          TABLE_NAME: 'tableName',
          BUCKET_NAME: 'bucketName',
          UNUSED: 'unused'
        }
      }
    });

    const template = Template.fromStack(stack);
    const expectedLambdaCount = apimdaApp.metadata.controllers.length;
    template.resourceCountIs('AWS::Lambda::Function', expectedLambdaCount);
    for (const route of apimdaApp.routes) {
      const routeMetadata = apimdaApp.metadata.findRouteByPath(route.path);
      expect(route.method === routeMetadata?.method.toString().toUpperCase());

      let lambdaProps: Record<string, any> = {
        Handler: `index.${route.handler}`,
        Runtime: 'nodejs16.x',
        Architectures: ['arm64']
      };

      if (route.path.startsWith('/decorator')) {
        lambdaProps = {
          ...lambdaProps,
          Environment: {
            Variables: {
              TABLE_NAME: 'tableName',
              BUCKET_NAME: 'bucketName'
            }
          }
        };
      }
      template.hasResourceProperties('AWS::Lambda::Function', lambdaProps);
    }
  });
});
