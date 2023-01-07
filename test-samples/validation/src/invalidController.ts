import { Body, Controller, Get, Path, Produces, Query } from '@apimda/runtime';

@Controller('/invalid/')
class InvalidController {
  // duplicate routes
  @Get('/appDupRoute')
  async appDupRouteOne() {}

  @Get('/appDupRoute')
  async appDupRouteTwo() {}

  @Get('/appDupRoute')
  async appDupRouteThree() {}

  // invalid routes
  @Get('rtInvalidNoStartSlash')
  async rtInvalidNoStartSlash() {}

  @Get('rtInvalidHasEndSlash/')
  async rtInvalidHasEndSlash() {}

  @Get('/rtOnlyOneBodyAllowed')
  async rtOnlyOneBodyAllowed(@Body() b1: string, @Body() b2: number) {}

  @Get('/rtMissingPathVarOne/{param}')
  async rtMissingPathVarOne() {}

  @Get('/rtMissingPathVar/{okayParam}/{missingParam}')
  async rtMissingPathVarTwo(@Path() okayParam: string) {}

  @Get('/rtDuplicatePathVar/{okayParam}/{okayParam}')
  async rtDuplicatePathVar(@Path() okayParam: string) {}

  // invalid inputs

  @Get('/outBufferNoMime/{optional}')
  async inputs(
    @Query() buffer: Buffer,
    @Body('text/html') mime: number,
    @Query() array: string[],
    @Query() generic: Set<string>,
    @Query() union: string | number,
    @Path() optional?: string
  ) {}

  // invalid outputs

  @Get('/outBufferNoMime')
  async outBufferNoMime(): Promise<Buffer> {
    return Buffer.from([]);
  }

  @Get('/outMimeNotSupported')
  @Produces('text/html')
  async outMimeNotSupported(): Promise<number> {
    return 0;
  }

  @Get('/outUndefinedNotSupported')
  async outUndefinedNotSupported(): Promise<undefined> {
    return undefined;
  }

  @Get('/outGenericNotSupported')
  async outGenericNotSupported(): Promise<Map<string, string>> {
    return new Map();
  }

  @Get('/outUnionNotSupported')
  async outUnionNotSupported(): Promise<string | undefined> {
    return undefined;
  }
}
