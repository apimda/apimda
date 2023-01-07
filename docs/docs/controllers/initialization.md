---
sidebar_position: 4
---

# Initialization

Controllers often have dependencies on other services, such as a database (Dynamo) or file store (S3). It's not a good
idea to hard code locations of these services directly into your code - instead, they should
be [injected](https://en.wikipedia.org/wiki/Dependency_injection)
or [discovered](https://en.wikipedia.org/wiki/Service_discovery).

Apimda provides two decorators to help with specific use cases: `@Env` for injecting information such as table or bucket names from a lambda runtime's environment and `@Init` to perform asynchronous initialization.

## @Env

`@Env` injects string values from a lambda runtime's environment into a controller's constructor. For example, to inject
the value of `DYNAMO_USER_TABLE` into a private `tableName` property:

```typescript
@Controller()
class MyController {
  constructor(@Env('DYNAMO_USER_TABLE') private tableName: string) {}
}
```

This has two advantages over using `process.env.DYNAMO_USER_TABLE` directly in code:

1. apimda will verify that `DYNAMO_USER_TABLE` is present in the lambda environment at deploy time, eliminating typo
   errors
2. apimda will provide only the environment variables a controller requires, adhering to
   the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege)

Note restrictions on use of `@Env`:

1. It can only be used in constructor arguments.
2. Arguments must be of type `string`.

## @Init

`@Init` allows asynchronous initialization of your controller class. This is often required to retrieve configuration
information from AWS services, e.g. [SecretsManager](https://aws.amazon.com/secrets-manager/) or

```typescript
@Controller()
class MyController {
  @Init()
  async init() {
    // look up something in an external service, e.g. AWS SecretsManager
  }
}
```

Note that the method you decorate with `@Init` must be:

1. The method must be `async`.
2. The method must be an instance method (not a `static` method).
3. The method must be not take any arguments (i.e. it must be parameter-less).
