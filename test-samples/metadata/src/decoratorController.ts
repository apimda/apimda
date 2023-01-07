import {
  Body,
  Controller,
  Cookie,
  Delete,
  Env,
  Get,
  Header,
  Init,
  Patch,
  Path,
  Post,
  Produces,
  Put,
  Query,
  Tags
} from '@apimda/runtime';

const PATH_VAR = '/const';

/**
 * Controller illustrating most variations of available decorators.
 * For injecting raw events (using @Request), see BuiltinController.
 */
@Controller('/decorator')
@Tags('decorator', 'controller')
export class DecoratorController {
  constructor(@Env('TABLE_NAME') tableName: string, @Env('BUCKET_NAME') bucketName: string, _optional?: string) {}

  /**
   * An async initializer method.
   */
  @Init()
  async asyncInitializer(): Promise<void> {}

  /**
   * A GET method with no path parameter.
   */
  @Get()
  async getNoParam(): Promise<void> {}

  /**
   * A GET method with a path parameter.
   */
  @Get('/path')
  async getWithParam(): Promise<void> {}

  /**
   * A POST method with no path parameter.
   */
  @Post()
  async postNoParam(): Promise<void> {}

  /**
   * A POST method with a path parameter.
   */
  @Post('/path')
  async postWithParam(): Promise<void> {}

  /**
   * A PUT method with no path parameter.
   */
  @Put()
  async putNoParam(): Promise<void> {}

  /**
   * A PUT method with a path parameter.
   */
  @Put('/path')
  async putWithParam(): Promise<void> {}

  /**
   * A PATCH method with no path parameter.
   */
  @Patch()
  async patchNoParam(): Promise<void> {}

  /**
   * A PATCH method with a path parameter.
   */
  @Patch('/path')
  async patchWithParam(): Promise<void> {}

  /**
   * A DELETE method with no path parameter.
   */
  @Delete()
  async deleteNoParam(): Promise<void> {}

  /**
   * A DELETE method with a path parameter.
   */
  @Delete('/path')
  async deleteWithParam(): Promise<void> {}

  /**
   * Inject request body (assumes application/json MIME type).
   */
  @Post('/bodyNoParam')
  async bodyNoParam(@Body() body: string): Promise<void> {}

  /**
   * Inject request body with custom MIME type.
   */
  @Post('/bodyWithParam')
  async bodyWithParam(@Body('text/plain') body: string): Promise<void> {}

  /**
   * Inject path parameter based upon variable name.
   */
  @Get('/pathNoParam/{name}')
  async pathNoParam(@Path() name: string): Promise<void> {}

  /**
   * Inject path parameter with custom path name.
   */
  @Get('/pathWithParam/{customName}')
  async pathWithParam(@Path('customName') name: string): Promise<void> {}

  /**
   * Inject querystring parameter based upon variable name.
   */
  @Get('/queryNoParam')
  async queryNoParam(@Query() name: string): Promise<void> {}

  /**
   * Inject querystring parameter with custom name.
   */
  @Get('/queryWithParam')
  async queryWithParam(@Query('customName') name: string): Promise<void> {}

  /**
   * Inject request header.
   */
  @Get('/header')
  async header(@Header('Accept-Language') language: string): Promise<void> {}

  /**
   * Inject cookie value.
   */
  @Get('/cookie')
  async cookie(@Cookie('cookieName') c: string): Promise<void> {}

  /**
   * Set Content-Type response header.
   */
  @Get('/produces')
  @Produces('text/html; charset=utf-8')
  async produces(): Promise<string> {
    return 'hello ';
  }

  /**
   * Using simple const string variable as string decorator param.
   */
  @Get(PATH_VAR)
  async getPathUsingVar() {}
}
