import { ApimdaApp, NpmLayerVersion } from '@apimda/deploy-cdk';
import * as apigw from '@aws-cdk/aws-apigatewayv2-alpha';
import * as apigwInt from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdkLogs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class UserApiStack extends cdk.Stack {
  // useful for dev, but should not be used in production
  public static removalPolicy = cdk.RemovalPolicy.DESTROY;

  public static userTableProps: dynamodb.TableProps = {
    partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
    sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
    removalPolicy: UserApiStack.removalPolicy
  };

  public awsRegion: cdk.CfnOutput;
  public tableName: cdk.CfnOutput;
  public apiUrl: cdk.CfnOutput;

  constructor(scope: Construct, stackName: string, stackProps: cdk.StackProps) {
    super(scope, stackName, stackProps);

    this.awsRegion = new cdk.CfnOutput(this, 'awsRegion', { value: cdk.Stack.of(this).region });

    const table = this.createTable();
    this.tableName = new cdk.CfnOutput(this, 'tableName', { value: table.tableName });

    const api = this.createApi(table);
    this.apiUrl = new cdk.CfnOutput(this, 'apiUrl', { value: api.url! });
  }

  createTable(): dynamodb.Table {
    return new dynamodb.Table(this, 'UserTable', UserApiStack.userTableProps);
  }

  createApi(table: dynamodb.Table): apigw.HttpApi {
    const layer = new NpmLayerVersion(this, 'DependencyLayer', {
      layerPath: 'src/deploy/layer',
      layerVersionProps: {
        removalPolicy: UserApiStack.removalPolicy,
        compatibleArchitectures: [lambda.Architecture.X86_64, lambda.Architecture.ARM_64],
        compatibleRuntimes: [lambda.Runtime.NODEJS_16_X]
      }
    });

    const apimdaApp = new ApimdaApp(this, 'ApimdaApp', {
      tsConfigPath: require.resolve('../../tsconfig.json'),
      lambdaProps: {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_16_X,
        logRetention: cdkLogs.RetentionDays.ONE_DAY,
        bundling: {
          minify: false,
          target: 'node16',
          externalModules: layer.packagedDependencies
        },
        layers: [layer.layerVersion],
        environment: {
          TABLE_NAME: table.tableName
        }
      }
    });

    const api = new apigw.HttpApi(this, 'Api', {});
    for (const route of apimdaApp.routes) {
      const integration = new apigwInt.HttpLambdaIntegration(`${route.handler}Integration`, route.lambda);
      api.addRoutes({
        path: route.path,
        methods: [route.method as apigw.HttpMethod],
        integration
      });

      if (route.method === apigw.HttpMethod.GET) {
        table.grantReadData(route.lambda);
      } else {
        table.grantReadWriteData(route.lambda);
      }
    }
    return api;
  }
}
