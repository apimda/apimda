# User API sample

This sample contains an API that stores/retrieves `User`s in a Dynamo table.

## Domain

The user domain model is specified in `src/domain.ts`. It illustrates the use of JSDoc annotations for
JSON schema validation:

- `UUID` type alias for `string` with `@format uuid` to validate a UUID string
- `@examples` to provide example UUID format in documentation
- `User.email` uses `@format email` to validate an email string

These JSDoc annotations are not supported directly by apimda, rather they are implemented
by [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator) that is currently used for JSON schema
generation in apimda.

It also showcases how you can use type aliases to define request bodies for `PUT`, `PATCH`, and `POST` operations (not
that we necessarily recommend this approach).

## API

The API implements 5 endpoints in `src/userController.ts`:

- `GET /users` - find all users, optionally filtered by user type
- `GET /users/{userId}` - find user by ID
- `POST /users` - create a user
- `PUT /users/{userId}` - update a user
- `DELETE /users/{userId}` - delete a user

The constructor uses `@Env` to inject the dynamo table name from the environment into the controller.

## Testing

Because controllers are just typescript classes with decorators, you can write automated tests for them easily. Run your
dependencies locally in containers (or mock them) and write your tests. There is no need to deal with HTTP
requests/responses; apimda does that for you.

Local, Docker-based integration tests for the controller are implemented in `src/userController.test.ts`.

## Deployment

The `src/deploy` directory contains the CDK code to deploy to AWS.

It illustrates how to use an `ApimdaApp` construct to generates lambda handlers / metadata and add routes to API
Gateway.

The deployment also illustrates how to use the `NpmLayerVersion` construct to use a lambda layer to package common
runtime dependencies.

## OpenAPI documentation

You can generate the API docs using the `docs` npm script:

```bash
npm run docs -w @apimda/samples-user-api
```
