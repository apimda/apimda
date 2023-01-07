import { statusCodeToDesc } from '@apimda/runtime';
import { OpenAPIV3_1 as OAPI } from 'openapi-types';
import { ApimdaConfig } from './config';
import { AppMetadata, InputLocation, InputMetadata, OutputMetadata, RouteMetadata } from './metadata';
import { groupBy } from './utils';

const parameterLocations = [InputLocation.Query, InputLocation.Path, InputLocation.Header, InputLocation.Cookie];
const binarySchema: OAPI.SchemaObject = {
  type: 'string',
  format: 'binary'
};
const defaultInfo: OAPI.InfoObject = {
  title: 'API Title',
  version: '0.1.0'
};
type ApimdaConfigPaths = Record<string, { [method in OAPI.HttpMethods]?: Pick<OAPI.OperationObject, 'security'> }>;

export class OpenApiGenerator {
  private readonly refSchemas: Record<string, any> = {};
  private readonly paramSchemas: Record<string, any> = {};

  constructor(private readonly metadata: AppMetadata, private readonly config?: ApimdaConfig) {
    const allSchemas = metadata.schemas?.copy(r => '#/components/schemas/' + r) || {};
    const paramSchemaKeys = metadata.controllers.flatMap(c => c.routes.flatMap(r => r.schemaKeys));
    for (const key in allSchemas) {
      if (paramSchemaKeys.includes(key)) {
        this.paramSchemas[key] = allSchemas[key];
      } else {
        this.refSchemas[key] = allSchemas[key];
      }
    }
  }

  private schema(inout: InputMetadata | OutputMetadata) {
    if (inout.declaredTypeName === 'Buffer') {
      return binarySchema;
    }
    return this.paramSchemas[inout.schemaKey!];
  }

  private parameter(input: InputMetadata): OAPI.ParameterObject {
    return {
      name: input.name,
      in: input.location,
      required: input.required,
      schema: this.schema(input),
      description: input.description
    };
  }

  private content(inout: InputMetadata | OutputMetadata): Record<string, OAPI.MediaTypeObject> {
    const mime = inout.mimeType ?? inout.declaredTypeName === 'string' ? 'text/plain' : 'application/json';
    return {
      [mime]: {
        schema: this.schema(inout)
      }
    };
  }

  private requestBody(input: InputMetadata): OAPI.RequestBodyObject {
    return {
      description: input.description,
      required: input.required,
      content: this.content(input)
    };
  }

  private response(output: OutputMetadata): OAPI.ResponseObject {
    const result = {
      description: output.description ? output.description : statusCodeToDesc[output.statusCode]
    };
    return output.declaredTypeName ? { ...result, content: this.content(output) } : result;
  }

  private operation(route: RouteMetadata, security?: OAPI.SecurityRequirementObject[]): OAPI.OperationObject {
    const parameters = route.inputs
      .filter(input => parameterLocations.includes(input.location))
      .map(input => this.parameter(input));

    const bodyInput = route.inputs.find(input => input.location === InputLocation.Body);
    const requestBody = bodyInput ? this.requestBody(bodyInput) : undefined;
    const responses: OAPI.ResponsesObject = {};
    for (const output of route.outputs) {
      responses[output.statusCode] = this.response(output);
    }
    const operationId = `${route.controller.className}_${route.classMethodName}`;
    const tags = route.controller.tags.concat(route.tags);
    return {
      tags,
      summary: route.summary ?? route.description,
      description: route.description,
      operationId,
      parameters,
      requestBody,
      responses,
      security
    };
  }

  private paths(configPaths: ApimdaConfigPaths): OAPI.PathsObject {
    const allRoutes = this.metadata.controllers.flatMap(c => c.routes);
    const routesByPath = groupBy(allRoutes, r => r.path);
    const result: Record<string, Record<string, OAPI.OperationObject>> = {};
    for (const path in routesByPath) {
      const operationsByMethod: Record<string, OAPI.OperationObject> = {};
      const configPath = configPaths[path] ?? {};
      for (const route of routesByPath[path]) {
        const configMethod = configPath[route.method];
        operationsByMethod[route.method] = this.operation(route, configMethod?.security);
      }
      result[path] = operationsByMethod;
    }
    return result;
  }

  generate(): OAPI.Document {
    const { info, security, servers, paths } = this.config?.openApi ?? {};

    const securitySchemes = this.config?.openApi?.components?.securitySchemes;
    const components: OAPI.ComponentsObject = {
      schemas: this.refSchemas,
      securitySchemes
    };

    const tags: OAPI.TagObject[] = this.metadata.uniqueTags.map(t => ({ name: t }));
    return {
      openapi: '3.1.0',
      info: info ?? defaultInfo,
      paths: this.paths(paths ?? {}),
      components,
      tags,
      servers,
      security
    };
  }
}
