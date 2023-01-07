---
sidebar_position: 1
---

# Routes

Routing in apimda mirrors that of AWS [API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html), in that there are two elements of the HTTP request that determine a route:

1. HTTP method, e.g. `GET` or `POST`.
2. Request path, e.g. in `http://example.com/users/12` the path would be `/users/{userId}`.

## HTTP Methods

Apimda currently supports five HTTP methods. They are only valid on instance methods of a `@Controller` class:

| HTTP Method | Decorator  |
| ----------- | ---------- |
| `GET`       | `Get()`    |
| `POST`      | `Post()`   |
| `PUT`       | `Put()`    |
| `PATCH`     | `Patch()`  |
| `DELETE`    | `Delete()` |

Note that instance methods _must be_ marked as `async` and return `Promise`s.

## Path matching

Paths are matched using the same syntax as that of AWS [API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html).

- Path parameters are denoted using curly braces, e.g. `/pets/dog/{id}`
- `{proxy+}` and `$default` are not currently supported by apimda.

A controller _may_ declare a base path. All routes will then be relative to that path. For example:

```typescript
@Controller('/pets')
class PetController {
  @Get()
  async getAllPets(): Promise<Pet[]> {
    // return all pets
  }

  @Get('/{petId}')
  async getById(@Path() petId: UUID): Promise<Pet> {
    // return pet or 404...
  }

  @Delete('/{petId}')
  async deleteById(@Path() petId: UUID): Promise<void> {
    // delete pet or 404...
  }
}
```

... `GET /pets` will return all pets and `GET /pets/12` would return the pet with pet ID of 12. Likewise `DELETE /pets/24` would delete the pet with ID of 24.

Some restrictions on paths:

1. All paths in your code _must_ be unique; apimda will generate an error if you attempt to deploy controllers with duplicate paths (e.g. `/pets/{id}` and `/pets/{petId}`).
2. Paths must _start with_ but _not end with_ a forward slash `/`.
