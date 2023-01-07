import { Controller, Get, HttpError, Query } from '@apimda/runtime';
import { methodNotAllowed, MoreErrors } from './moreErrors';

function missing() {
  throw new HttpError(404);
}

@Controller('/httpError')
export class HttpErrorController {
  private readonly more = new MoreErrors();

  private static forbidden() {
    throw new HttpError(403);
  }

  unauthorized() {
    throw new HttpError(401);
  }

  @Get()
  async findAllTheErrors(@Query() str: string) {
    this.unauthorized();
    if (str === 'payment required') {
      throw new HttpError(402);
    }
    HttpErrorController.forbidden();
    missing();
    methodNotAllowed();
    MoreErrors.notAcceptable()();
    // the following aren't currently found by apimda
    this.more.proxyAuthRequired();
    this.more.requestTimeout();
    this.more.conflict();
  }
}
