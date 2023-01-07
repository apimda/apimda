import { AppMetadata } from '@apimda/devtime';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as fs from 'fs';
import path from 'path';

/**
 * Properties for ApimdaApp construct.
 */
export interface ApimdaAppProps {
  /**
   * Path to the project's tsconfig.json file.
   */
  tsConfigPath: string;

  /**
   * Properties to use when creating lambda functions.
   */
  lambdaProps?: NodejsFunctionProps;
}

/**
 * Information about a route in an ApimdaApp construct.
 */
export interface ApimdaRoute {
  /**
   * Name of the handler function in the lambda.
   */
  handler: string;

  /**
   * HTTP method for the route, e.g. GET, POST, ...
   */
  method: string;

  /**
   * Path for the route, e.g. /users/{userId}
   */
  path: string;

  /**
   * The lambda that handles requests.
   */
  lambda: NodejsFunction;
}

/**
 * Construct providing routes including lambdas to execute your controllers.
 */
export class ApimdaApp extends Construct {
  /**
   * The routes for the app, including the lambda function to handle them.  Use this to add routes to an API Gateway.
   */
  public routes: ApimdaRoute[];

  /**
   * The metadata for the app.  For testing purposes only.
   */
  public metadata: AppMetadata;

  constructor(scope: Construct, id: string, props: ApimdaAppProps) {
    super(scope, id);

    this.metadata = AppMetadata.fromTsConfig(props.tsConfigPath);
    this.routes = [];
    const userLambdaProps = props.lambdaProps ?? {};
    const userLambdaEnv = props.lambdaProps?.environment ?? {};

    for (const controller of this.metadata.controllers) {
      const controllerEnv: Record<string, string> = {};
      for (const envName of controller.ctorEnvNames) {
        if (!userLambdaEnv.hasOwnProperty(envName)) {
          throw new Error(
            `Required environment variable '${envName}' for controller '${controller.className}' not found in ApimdaAppProps.lambdaProps.environment`
          );
        }
        controllerEnv[envName] = userLambdaEnv[envName];
      }

      const dirname = path.dirname(controller.sourceFile);

      const handler = `handler_${controller.className}`;
      const entry = path.join(dirname, `__handler_${handler}.ts`);
      const ctorArgs = controller.ctorEnvNames.map(env => `process.env['${env}']`).join();
      const fileContents = `
        import {createAwsLambdaHandler} from "@apimda/runtime-lambda";
        import {${controller.className}} from "${controller.moduleName}";
        const app = ${JSON.stringify(controller.runtimeApp)};
        export const ${handler} = createAwsLambdaHandler(app, new ${controller.className}(${ctorArgs}));
      `;

      fs.writeFileSync(entry, fileContents);
      try {
        const lambda = new NodejsFunction(this, handler, {
          ...userLambdaProps,
          environment: controllerEnv,
          entry,
          handler
        });

        for (const route of controller.routes) {
          this.routes.push({
            method: route.method.toUpperCase(),
            path: route.path,
            handler,
            lambda
          });
        }
      } finally {
        fs.unlinkSync(entry);
      }
    }
  }
}
