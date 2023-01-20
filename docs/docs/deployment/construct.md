---
sidebar_position: 1
---

# ApimdaApp

Apimda provides an `ApimdaApp` [CDK Construct](https://docs.aws.amazon.com/cdk/v2/guide/constructs.html) that generates lambda functions for your controllers.

## Creating an ApimdaApp

Following CDK conventions, you create an `ApimdaApp` construct by passing in properties, `ApimdaAppProps`:

1. `tsConfigPath`: path to your project's `tsconfig.json` typescript configuration file
2. `lambdaProps`: `NodejsFunctionProps` properties to use to create lambda functions

For example, the following code creates an ApimdaApp that generates one function per controller, and configures lambda architecture, NodeJS runtime, and log retention:

```typescript
const lambdaProps: NodejsFunctionProps = {
  architecture: lambda.Architecture.ARM_64,
  runtime: lambda.Runtime.NODEJS_16_X,
  logRetention: cdkLogs.RetentionDays.ONE_DAY
};

const apimdaApp = new ApimdaApp(this, 'ApimdaApp', {
  tsConfigPath: require.resolve('../tsconfig.json'),
  lambdaProps
});
```

## Adding Routes to API Gateway

The `ApimdaApp` construct provides readonly access to an array of `ApimdaRoute`s to be added to an API Gateway. Each route contains the following information:

1. `handler`: Name of the handler function in the lambda
2. `method`: HTTP method for the route, e.g. GET, POST, ...
3. `path`: Path for the route, e.g. /users/{userId}
4. `lambda`: The `NodejsFunction` lambda that handles requests

Here's an example of how to add routes to an API Gateway V2 [HttpApi](https://docs.aws.amazon.com/cdk/api/v2/docs/@aws-cdk_aws-apigatewayv2-alpha.HttpApi.html):

```typescript
const api = new HttpApi(this, 'Api', {}); // APIGW v2 construct
for (const route of apimdaApp.routes) {
  const integration = new HttpLambdaIntegration(`${route.handlerName}_int`, route.lambda);
  api.addRoutes({
    path: route.path,
    methods: [route.method as apigw.HttpMethod],
    integration
  });
}
```
