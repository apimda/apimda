---
sidebar_position: 3
---

# Responses

## Successful Responses and Serialization

Apimda returns results from typescript to directly to API Gateway, which sets the `Content-Type` header
to `application/json`. This is the desired behavior for the vast majority of REST responses.

However, there are cases where an API needs to return other MIME types. To do this, return either a `string` for text
data or `Buffer` for binary data, and use the `@Provides` decorator to indicate the type. For example, to return a PNG
image:

```typescript
@Controller()
class SampleController {
  @Get('/images/{imageId}')
  @Provides('image/png')
  async getImage(@Path() imageId: string): Promise<Buffer> {
    const buffer = loadImage(imageId); // load image into buffer, e.g. from S3
    return buffer;
  }
}
```

Note that apimda automatically encodes binary data as a base 64 encoded string, setting the `isBase64Encoded` flag
appropriately, when sending the response to API Gateway.

Likewise, to return a custom XML response:

```typescript
@Controller()
class SampleController {
  @Get('/docs/{docId}')
  @Provides('application/xml')
  async getDoc(@Path() docId: string): Promise<string> {
    const xmlAsString = loadDoc(imageId); // load XML as string, e.g. from S3
    return xmlAsString;
  }
}
```

## Errors

Apimda will [automatically validate custom input types](requests.md#custom-type-validations), returning an `400` HTTP
error code if the request not well formed.

You can instruct apimda to return specific HTTP error status codes by throwing an instance of the `HttpError` class. For
example, the code below returns a `404` response when a resource cannot be found:

```typescript
@Controller('/user')
class UserController {
  @Get('/{userId}')
  async getUser(@Query() userId: string): Promise<User> {
    const result = findUserById(userId);
    if (!result) {
      throw new HttpError(404);
    }
    return user;
  }
}
```

You can also provide custom status codes, for both successful and error responses,
by [returning a custom response](#custom-responses).

:::info Throwing HttpError
Apimda does not currently reliably detect `HttpError`s that are **_not_** constructed in the `throws` statement.

For example, apimda will not know that this method can return a `404`, because the error is constructed in
the `notFoundErr` function, and not inline with the `throws` statement:

```typescript
@Controller()
class SampleController {
  @Get('/{userId}')
  async getUser(@Query() userId: string): Promise<User> {
    const notFoundErr = (message?: string) => {
      return new HttpError(404, message);
    };
    const result = findUserById(userId);
    if (!result) {
      throw notFoundErr();
    }
    return user;
  }
}
```

While there is no impact of this at runtime (apimda will catch every HttpError and return the appropriate error code in
the response), it means that the `404` error code will not show up in [OpenAPI documentation](../openapi.md) and may
cause issues in future versions.

:::

## Custom Responses

Fully custom responses may be provided by simply returning the `ApimdaResult<T>` type. It enables full OpenAPI response
documentation, as well as more sophisticated response handling, including proper encoding of `Buffer` return types.

```typescript
@Controller()
class SampleController {
  @Get('/users/{userId}')
  async apimdaResult(@Path() userId: UUID): Promise<ApimdaResult<User>> {
    const user = findUserById(userId);
    return { statusCode: 201, result: user }; // return anything allowed by API Gateway except "body"
  }
}
```

:::info Returning API Gateway V2 Result

Note that while controller methods may _currently_ return `APIGatewayProxyStructuredResultV2`, it is highly discouraged.
It provides no benefit over `ApimdaResult<T>`, disables proper Open API documentation of responses, forces manual
binary encoding, and couples controllers to API Gateway types.

Future versions of apimda may support environments outside of API Gateway V2, and support may be dropped in a future
version.

:::
