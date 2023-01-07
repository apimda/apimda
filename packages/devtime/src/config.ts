import { OpenAPIV3_1 as OAPI } from 'openapi-types';

export type ApimdaConfig = {
  openApi?: Partial<Pick<OAPI.Document, 'info' | 'servers' | 'security'>> & {
    paths?: Record<string, { [method in OAPI.HttpMethods]?: Pick<OAPI.OperationObject, 'security'> }>;
    components?: Pick<OAPI.ComponentsObject, 'securitySchemes'>;
  };
};
