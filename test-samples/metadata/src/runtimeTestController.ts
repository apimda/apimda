import { ApimdaResult, Body, Controller, Get, Init, Post, Produces, Query } from '@apimda/runtime';

export interface OptionalEmail {
  /**
   * @format email
   */
  email?: string;
}

export interface GenericResult<T> {
  value: T;
  count: number;
}

export type EmailResult = GenericResult<OptionalEmail>;

/**
 * @format uuid
 */
export type UUID = string;

/**
 * Controller used to test runtime.
 */
@Controller()
export class RuntimeTestController {
  public static readonly apimdaResult: ApimdaResult<OptionalEmail> = {
    statusCode: 201,
    headers: { header1: 'value1', header2: 'value2' },
    cookies: { cookie1: 'value1', cookie2: 'value2' },
    result: { email: 'test@test.com' }
  };

  public static readonly apimdaResultWithBuffer: ApimdaResult<Buffer> = {
    headers: { header1: 'value1' },
    result: Buffer.from('data')
  };

  public static readonly genericResultValue: GenericResult<OptionalEmail> = {
    count: 10,
    value: { email: 'test@test.com' }
  };

  constructor(private initialized: boolean = false) {}

  @Init()
  async init() {
    this.initialized = true;
  }

  @Get('/testInitMethod')
  async testInitMethod() {
    return this.initialized;
  }

  @Get('/testOptionalQuery')
  async testOptionalQuery(@Query() id?: UUID): Promise<string> {
    return id ? 'yes' : 'no';
  }

  @Post('/testBodyValidation')
  async testBodyValidation(@Body() body: OptionalEmail): Promise<OptionalEmail> {
    return body;
  }

  @Post('/testBinaryHandling')
  @Produces('application/octet-stream')
  async testBinaryHandling(@Body('application/octet-stream') data: Buffer): Promise<Buffer> {
    return data;
  }

  @Get('/apimdaResult')
  async apimdaResult(): Promise<ApimdaResult<OptionalEmail>> {
    return RuntimeTestController.apimdaResult;
  }

  @Get('/apimdaResultWithBuffer')
  @Produces('application/octet-stream')
  async apimdaResultWithBuffer(): Promise<ApimdaResult<Buffer>> {
    return RuntimeTestController.apimdaResultWithBuffer;
  }

  @Get('/genericResult')
  async genericResult(): Promise<EmailResult> {
    return RuntimeTestController.genericResultValue;
  }
}
