import { PathInfo } from './pathInfo';

describe('PathInfo tests', () => {
  test('Empty path', () => {
    const info = PathInfo.parse('');
    expect(info.normalizedPath).toBe('');
    expect(info.pathVars).toHaveLength(0);
  });
  test('Basic path', () => {
    const info = PathInfo.parse('/');
    expect(info.normalizedPath).toBe('/');
    expect(info.pathVars).toHaveLength(0);
    expect(info.match('/')).toStrictEqual({});
    expect(info.match('/users')).toBeUndefined();
  });
  test('Normal API path', () => {
    const info = PathInfo.parse('/users/{userId}');
    expect(info.normalizedPath).toBe('/users/{}');
    expect(info.pathVars).toStrictEqual(['userId']);
    expect(info.match('/')).toBeUndefined();
    expect(info.match('/users')).toBeUndefined();
    expect(info.match('/users/one')).toStrictEqual({ userId: 'one' });
    expect(info.match('/users/one/two')).toBeUndefined();
  });
  test('Normal API path with two params', () => {
    const info = PathInfo.parse('/users/{userId}/cars/{carId}');
    expect(info.normalizedPath).toBe('/users/{}/cars/{}');
    expect(info.pathVars).toStrictEqual(['userId', 'carId']);
    expect(info.match('/')).toBeUndefined();
    expect(info.match('/users')).toBeUndefined();
    expect(info.match('/users/one')).toBeUndefined();
    expect(info.match('/users/one/two')).toBeUndefined();
    expect(info.match('/users/one/cars/two')).toStrictEqual({ userId: 'one', carId: 'two' });
    expect(info.match('/users/one/cars/two/')).toBeUndefined();
  });
  test('Weird path', () => {
    const info = PathInfo.parse('/one/two/{three}/four/fi{v_}e/{six6}/{seve}n/eight/n{ine}/');
    expect(info.normalizedPath).toBe('/one/two/{}/four/fi{v_}e/{}/{seve}n/eight/n{ine}/');
    expect(info.pathVars).toStrictEqual(['three', 'six6']);
    expect(info.match('/one/two/three/four/fi{v_}e/six/{seve}n/eight/n{ine}/')).toStrictEqual({
      three: 'three',
      six6: 'six'
    });
  });
});
