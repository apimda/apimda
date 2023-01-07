---
sidebar_position: 2
---

# Requests

Apimda validates and injects key elements of an HTTP request, such as query/path parameters, headers, cookies, and
request body into your handler methods. This allows you to focus on writing business logic, and provides a single source
of truth for your API deployment, implementation, and documentation. It does so using
the [parameter decorators](https://www.typescriptlang.org/docs/handbook/decorators.html#parameter-decorators) described
below.

## @Path

`@Path` injects a path parameter into your handler method.

It takes an optional argument specifying the path parameter's name, though this isn't usually needed as it defaults to
the assigned variable's name.

```typescript
@Controller('/orders')
class OrderController {
  @Get('/{orderId}')
  async getById(@Path() orderId: number): Promise<Order> {
    // ...
  }
}
```

For example, in the request above:

- `GET /orders/1256` would have `orderId` of `1256`

Note:

- All declared `@Path()` parameters _must be_ present in the route.
- Every parameter declared in the route _must have_ a `@Path()` parameter assigned.
- Optional path variables are _not allowed_.

## @Query

`@Query(queryParamName)` injects a query string parameter into your handler method.

It takes an optional argument specifying the query string parameter's name, though this isn't usually needed as it
defaults to the assigned variable's name.

```typescript
@Controller('/orders')
class OrderController {
  @Get()
  async findOrders(@Query() orderType?: string): Promise<Order> {
    // return all orders, optionally filtered by order type
  }
}
```

For example, in the request above:

- `GET /orders?orderType=PARTNER` would have `orderType` of `"PARTNER"`.
- `GET /orders` would have `orderType` as `undefined`

Note:

- You can optionally specify a different variable name from the query parameter.
- Query parameters may be optional.

## @Header

`@Header` injects a header value into your handler method. It takes a single required parameter specifying the header's
name.

```typescript
@Controller()
class SampleController {
  @Get('/isWebKit')
  async isWebKit(@Header('User-Agent') userAgent?: string): Promise<boolean> {
    // return true if webkit-based browser
  }
}
```

- Header names must be specified in `@Header()` decorator.
- Injected header values may be optional.

## @Cookie

`@Cookie` injects a cookie value into your handler method. It takes a single required parameter specifying the cookie's
name.

```typescript
@Controller()
class SampleController {
  @Get('/sample')
  async sample(@Cookie('CookieName') cookie?: string): Promise<boolean> {
    // ...
  }
}
```

- Cookie names must be specified in `@Cookie()` decorator.
- Injected cookie values may be optional.

## @Body

`@Body` injects the request body into your handler method. It takes a single optional parameter, indicating the body's
MIME type.

```typescript
@Controller('/user')
class UserController {
  @Post()
  async createUser(@Body() user: User): Promise<User> {
    // create and return user
  }

  @Put('/{userId}')
  async updateUser(@Body() user: User): Promise<User> {
    // update and return user
  }

  @Put('/{userId}/avatar')
  async setAvatar(@Path() userId: string, @Body('image/*') avatar: Buffer) {
    // upload/replace binary avatar image for user
  }
}
```

How the body is injected depends upon the parameter type:

- For custom types (default), apimda will deserialize the body as JSON and validate it against the type definition (
  see `createUser` and `updateUser` above).
- For binary data, apimda will ensure that the body is binary (i.e. the isBase64Encoded property of the API Gateway
  event is `true`), and decode the data automatically into a `Buffer` (see `setAvatar` above).
- For text data, apimda will inject the body as a `string` directly from API Gateway event.

Note:

- There are limitations on custom types / JSON deserialization. See below.
- You can only have one `@Body` parameter per handler method.

## @Request

`@Request` injects the raw value of the API Gateway event into your handler method.

```typescript
@Controller()
class SampleController {
  @Get('/sample')
  async sample(@Request() event: APIGatewayProxyEventV2) {
    // ...
  }
}
```

Note:

- The specific type of AWS API Gateway event will depend on how you've configured your route. For example, you can
  use `APIGatewayProxyEventV2WithJWTAuthorizer` if you've configured an appropriate authorizer. Apimda leaves this
  completely up to you. Be careful and select the base event type `APIGatewayProxyEventV2` unless you're certain you
  need the additional data from other event types AND you've properly configured your route/authorizer.
- You can only have one `@Request` parameter per handler method.

## Custom Type Validations

Apimda validates custom input types using JSON schemas. How this currently works:

1. Apimda [generates](https://github.com/vega/ts-json-schema-generator) JSON schemas for all non-primitive types at
   deploy time.
2. Non-primitive types are [validated](https://ajv.js.org) against their schemas using at runtime.
3. If schema validation fails, a `400: Bad Request` response is sent to the client.

Apimda relies upon the types you declare (or are inferred by the typescript compiler), some custom logic, and some third
party libraries (see above) for JSON deserialization and validation. This means that there are limitations.

### Use type aliases or interfaces instead of classes

Apimda cannot deserialize JSON into typescript classes. Use interfaces and type aliases instead.

### Apimda has limited support for generic types

Apimda can only currently deserialize arrays, i.e. `Array<T>` or `T[]`. It cannot deserialize other generic types. If
you need to use a generic of a specific type, however, you can use a type alias. For example, it's common to
use `Partial<T>` to make the input to a `PATCH` request optional:

```typescript
interface User {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

type UserPatch = Partial<User>;

@Controller('/users')
class UserController {
  @Post()
  async createUser(@Body() user: User): Promise<User> {
    // create and return user
  }

  @Patch('/{userId}')
  async patchUser(@Path userId: string, @Body() user: UserPatch): Promise<User> {
    // partially update and return user
  }
}
```

In the example above, we use the standard `User` type for `POST` and `PUT`, but the partial alias `UserPatch`
for `PATCH` to work around the generic type limitations on request parameters. You can use type aliases to work around
some generic type limitations in apimda.

Another common use case is to return a page of objects from a controller method:

```typescript
interface Page<T> {
  results: T[];
  offset: number;
  count: number;
}

type UserPage = Page<User>;

@Controller('/users')
class UserController {
  @Get()
  async getPageOfUsers(@Query() limit: number, @Query offset: number): Promise<UserPage> {
    // return page of users
  }
}
```

### Avoid using union types (except optionals)

Apimda cannot decode union types as input parameters. You can use type aliases to workaround this similarly as with
generics (see above).

(The one exception is optional function arguments, which are similar to union types but not exactly the same.)

### Extend validation with JSDoc annotations

You can use [JSDoc annotations](https://github.com/vega/ts-json-schema-generator/tree/next/src/AnnotationsReader) to
extend JSON schema validation.

You can combine them with type aliases to validate strings against patterns or use pre-defined JSON schema formats.

```typescript
/**
 * UUID v4
 * See [RFC 4112](https://tools.ietf.org/html/rfc4122)
 * @format uuid
 * @examples ["52907745-7672-470e-a803-a2f8feb52944"]
 */
export type UUID = string;

@Controller('/pets')
class PetController {
  @Get('/{petId}')
  async getById(@Path() petId: UUID): Promise<Pet> {
    // ...
  }
}
```

In the example above:

- `GET /pets/1f31905f-5c30-419a-9aa6-a65192af5426` would invoke `getById` with `petId`
  of `1f31905f-5c30-419a-9aa6-a65192af5426`
- `GET /pets/1677` would return `400: Bad Request` to the client without ever invoking `getById`

### Custom validation

In cases where out-of-the-box support is not sufficient, you can always declare your arguments as `string` or
use `@Request` to perform your own custom validation. If there's a feature that you think should be built in, we
welcome [contributions](/docs/contributions)!
