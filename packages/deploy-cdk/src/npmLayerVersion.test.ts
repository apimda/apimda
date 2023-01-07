import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NpmLayerVersion } from './npmLayerVersion';

describe('NpmLayer', () => {
  test('creates correct lambda layer', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'ApimdaStack');
    const lvProps = {
      removalPolicy: RemovalPolicy.DESTROY,
      compatibleArchitectures: [lambda.Architecture.X86_64, lambda.Architecture.ARM_64],
      compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
      description: 'sample description'
    };
    const layer = new NpmLayerVersion(stack, 'NpmLayer', {
      layerPath: '../../samples/user-api/src/deploy/layer',
      layerVersionProps: lvProps
    });
    expect(layer.packagedDependencies.sort()).toStrictEqual(
      ['@aws-sdk/client-dynamodb', '@aws-sdk/lib-dynamodb', 'ajv', 'ajv-formats'].sort()
    );

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Lambda::LayerVersion', 1);
    template.hasResourceProperties('AWS::Lambda::LayerVersion', {
      CompatibleArchitectures: ['x86_64', 'arm64'],
      CompatibleRuntimes: ['nodejs16.x'],
      Description: 'sample description'
    });
  });
});
