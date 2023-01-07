import { HttpError } from './httpError';
import { statusCodeToDesc } from './httpStatusCode';

describe('HTTP error tests', () => {
  test('top level app', () => {
    expect(new HttpError(500).statusCode).toBe(500);
    expect(new HttpError(500).message).toBe(statusCodeToDesc[500]);
    expect(new HttpError(500, 'msg').message).toBe('msg');
  });
});
