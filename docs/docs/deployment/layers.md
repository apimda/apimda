---
sidebar_position: 2
---

# NpmLayerVersion

Apimda has a `NpmLayerVersion` construct to create a custom [lambda layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html) from an NPM package.json file. This is useful for packaging your project's dependencies into a layer to speed up deployment and lower cold start times.

Simply list the packages you'd like to be included in `package.json`, and apimda will make sure they're up-to-date (i.e. `npm install`) before every deployment, and then generate the layer itself as a CDK [LayerVersion](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda.LayerVersion.html).

## Directory Structure

The `NpmLayerVersion` requires the following directory structure, as specified by [AWS Lambda layer path configuration](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html#configuration-layers-path)

```
<root>
|- <custom code>
|- nodejs
   |- package.json
   |- package-lock.json
```

## Creating NpmLayerVersion

You can create an `NpmLayerVersion` with the following `NpmLayerVersionProps`:

1. Path to the directory structure of the layer, relative to your `tsconfig.json`
2. Custom [LayerVersionProps](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda.LayerVersionProps.html) to pass to the underlying CDK `LayerVersion` construct:

```typescript
const layer = new NpmLayerVersion(this, 'DependencyLayer', {
  layerPath: 'src/deploy/layer',
  layerVersionProps: {
    removalPolicy: UserApiStack.removalPolicy,
    compatibleArchitectures: [lambda.Architecture.X86_64, lambda.Architecture.ARM_64],
    compatibleRuntimes: [lambda.Runtime.NODEJS_16_X]
  }
});
```

## Using NpmLayerVersion

`NpmLayerVersion` provides two properties to be used when creating `NodejsFunction`s:

1. `layerVersion`: the underlying CDK `LayerVersion` representing the lambda layer itself
2. `packagedDependencies`: list of dependencies that were packaged.

The example below shows how to use this with [NodejsFunctionProps](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs.NodejsFunctionProps.html) to create an [ApimdaApp](./construct.md) construct:

```typescript
const lambdaProps: NodejsFunctionProps = {
  architecture: lambda.Architecture.ARM_64,
  runtime: lambda.Runtime.NODEJS_16_X,
  bundling: {
    minify: false,
    target: 'node16',
    externalModules: layer.packagedDependencies // don't bundle layer dependencies in lambda
  },
  layers: [layer.layerVersion] // use lambda layer
};

const apimdaApp = new ApimdaApp(this, 'ApimdaApp', {
  lambdaGenerationStrategy: LambdaGenerationStrategy.PER_CONTROLLER,
  tsConfigPath: require.resolve('../tsconfig.json'),
  lambdaProps
});
```

:::warning Packaging Apimda's Runtime

Currently `NpmLayerVersion.packagedDependencies` only reports dependencies that are explicitly declared in the layer's `package.json`.

As such, if you want to package all of apimda's runtime dependencies, you need to declare both `@apimda/runtime` and `@apimda/runtime-lambda` in your layer's `package.json`:

```json
{
  "name": "@my-project/base-layer",
  "version": "1.0.0",
  "dependencies": {
    "@apimda/runtime-lambda": "0.1.0",
    "@apimda/runtime": "0.1.0"
  }
}
```

If you only declare `@apimda/runtime-lambda`, the generated `NodeJsFunction`s will use esbuild to inline apimda's entire runtime including all of its dependencies - even large ones like [AJV](https://ajv.js.org) - directly in your lambda code. This will also cause issues with error handling, as apimda currently uses `instanceof HttpError` to distinguish between expected statuses (e.g. 400, 404, etc.) and unexpected errors (i.e. 500).

:::
