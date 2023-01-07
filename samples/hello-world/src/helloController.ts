import { Controller, Get, Query } from '@apimda/runtime';

@Controller()
export class HelloController {
  @Get('/hello')
  async getHello(@Query() name?: string): Promise<string> {
    return `Hello ${name ?? 'world'}!`;
  }
}
