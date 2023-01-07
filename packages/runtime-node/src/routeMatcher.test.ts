import { RouteMatcher } from './routeMatcher';

describe('RouteMatcher tests', () => {
  test('No routes', () => {
    const rm = new RouteMatcher();
    expect(rm.match('/')).toBeUndefined();
    expect(rm.match('/users/{userId}')).toBeUndefined();
  });
  test("Single '/' route", () => {
    const rm = new RouteMatcher();
    rm.add('/');
    expect(rm.match('/users/{userId}')).toBeUndefined();
    expect(rm.match('/')).toStrictEqual({
      path: '/',
      pathParameters: {}
    });
  });
  test("Single '/users/{userId}' route", () => {
    const rm = new RouteMatcher();
    rm.add('/users/{userId}');

    expect(rm.match('/')).toBeUndefined();
    expect(rm.match('/users/one/')).toBeUndefined();

    expect(rm.match('/users/one')).toStrictEqual({
      path: '/users/{userId}',
      pathParameters: { userId: 'one' }
    });
  });
  test("Many '/users' routes", () => {
    const rm = new RouteMatcher();
    rm.add('/users');
    rm.add('/users/{userId}');
    rm.add('/users/{userId}/cars/{carId}');
    rm.add('/users/create');
    rm.add('/users/update/{userId}');

    expect(rm.match('/')).toBeUndefined();
    expect(rm.match('/users/one/')).toBeUndefined();
    expect(rm.match('/users/one/cars/two/')).toBeUndefined();
    expect(rm.match('/users/create/one')).toBeUndefined();

    expect(rm.match('/users/one')).toStrictEqual({
      path: '/users/{userId}',
      pathParameters: { userId: 'one' }
    });

    expect(rm.match('/users/update')).toStrictEqual({
      path: '/users/{userId}',
      pathParameters: { userId: 'update' }
    });

    expect(rm.match('/users/one/cars/two')).toStrictEqual({
      path: '/users/{userId}/cars/{carId}',
      pathParameters: { userId: 'one', carId: 'two' }
    });

    expect(rm.match('/users/create')).toStrictEqual({
      path: '/users/create',
      pathParameters: {}
    });

    expect(rm.match('/users/update/one')).toStrictEqual({
      path: '/users/update/{userId}',
      pathParameters: { userId: 'one' }
    });
  });
});
