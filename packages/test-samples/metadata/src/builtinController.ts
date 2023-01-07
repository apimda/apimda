import { Body, Controller, Get, Post, Produces, Query, Request } from '@apimda/runtime';
import type { APIGatewayProxyEventV2 as Event, APIGatewayProxyStructuredResultV2 as Result } from 'aws-lambda';

/**
 * Controller illustrating use of built-in types.
 */
@Controller('/builtin')
export class BuiltinController {
  constructor() {}

  /**
   * A method representing a raw AWS APIGW lambda handler.
   */
  @Get('/raw')
  async raw(@Request() event: Event): Promise<Result> {
    return { statusCode: 200, body: '' };
  }

  /**
   * Primitive string type.
   */
  @Get('/stringPrimitive')
  async stringPrimitive(@Query() param: string): Promise<string> {
    return param;
  }

  /**
   * Primitive number type.
   */
  @Get('/numberPrimitive')
  async numberPrimitive(@Query() param: number): Promise<number> {
    return param;
  }

  /**
   * Primitive boolean type.
   */
  @Get('/booleanPrimitive')
  async booleanPrimitive(@Query() param: boolean): Promise<boolean> {
    return param;
  }

  /**
   * Optional param and void return type.
   */
  @Get('/optionalAndVoid')
  async optionalAndVoid(@Query() param?: string): Promise<void> {}

  /**
   * Binary types.
   */
  @Post('/binary')
  @Produces('image/png')
  async binary(@Body('image/png') data: Buffer): Promise<Buffer> {
    return data;
  }

  /**
   * Date type.
   */
  @Get('/dates')
  async dates(@Query() param: Date): Promise<Date> {
    return new Date();
  }

  /**
   * Array type.  Note: generic types are not currently supported for input parameters.
   */
  @Get('/arrays')
  async arrays(): Promise<string[]> {
    return ['one', 'two'];
  }

  /**
   * Set type.  Note: generic types are not currently supported for input parameters.
   */
  @Get('/sets')
  async sets(): Promise<Set<string>> {
    return new Set(['I have two elements', 'I have two elements', 'The other element']);
  }

  /**
   * Map type.
   */
  // @Get("/maps")
  // async maps(@Query() aMap: Map<string, boolean>): Promise<Map<string, boolean>> {
  //   return new Map<string, boolean>([
  //     ["yes", true],
  //     ["no", false],
  //   ]);
  // }

  /**
   * Record type.
   */
  // @Get("/records")
  // async records(@Query() aRecord: Record<string, boolean>): Promise<Record<string, boolean>> {
  //   return {
  //     yes: true,
  //     no: false,
  //   };
  // }

  /**
   * Combination: map with sets type.
   */
  // @Get("/maps")
  // async mapWithSets(@Query() aMap: Map<string, Set<string>>): Promise<Map<string, Set<string>>> {
  //   return new Map<string, Set<string>>([
  //     ["yes", new Set<string>(["yes"])],
  //     ["no", new Set<string>(["no"])],
  //   ]);
  // }
}
