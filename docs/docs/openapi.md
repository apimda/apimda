---
sidebar_position: 4
---

# Open API

Apimda can generate complete Open API 3.1 documentation, with some caveats.

For the most part, the same information present in the controller and method decorators is exactly what's needed for
this documentation. Additional information may be provided via a [configuration file](#configuration-file).

## Command Line Tool

To generate an Open API v3.1 specification in JSON format, use the `api` command in the `apimda` command line tool, with
the path to your `tsconfig.json` file:

```sh
apimda api path/to/my/tsconfig.json
```

You can also customize the output path for the JSON document or provide the path to a
non-standard [configuration file](#configuration-file). For a description of all parameters and options, use `help`
command:

```sh
apimda help api
```

## Configuration File

To provide additional information for Open API generation, create a configuration file called `apimda.config.js` in the
same directory as your `tsconfig.json`, and the CLI will find it automatically. Alternatively, you can provide the
full path to the configuration file as a CLI argument.

Currently, the following may be provided in an `openApi` property in the configuration file:

1. [Info Object](https://spec.openapis.org/oas/v3.1.0#info-object) to provide API metadata
2. [Server Objects](https://spec.openapis.org/oas/v3.1.0#server-object) to provide endpoints
3. Path-level [Security Requirements](https://spec.openapis.org/oas/v3.1.0#security-requirement-object) to specify which
   security scheme(s) to use for a specific path/operation (see 'security'
   in [Operation Object](https://spec.openapis.org/oas/v3.1.0#operation-object))
4. [Security Schemes](https://spec.openapis.org/oas/v3.1.0#security-scheme-object) (in components object) to specify
   available security schemes.
5. Top-level [Security Requirements](https://spec.openapis.org/oas/v3.1.0#security-requirement-object) to declare which
   security mechanisms can be used across the API (see 'security'
   in [OpenAPI Object](https://spec.openapis.org/oas/v3.1.0#openapi-object))

A full example is below (notice that it is a partial Open API document):

```javascript
module.exports = {
  openApi: {
    info: {
      title: 'Sample Pet Store App',
      summary: 'A pet store manager.',
      description: 'This is a sample server for a pet store.',
      termsOfService: 'https://example.com/terms/',
      contact: {
        name: 'API Support',
        url: 'https://www.example.com/support',
        email: 'support@example.com'
      },
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
      },
      version: '1.0.1'
    },
    servers: [
      {
        url: 'https://development.gigantic-server.com/v1',
        description: 'Development server'
      },
      {
        url: 'https://staging.gigantic-server.com/v1',
        description: 'Staging server'
      }
    ],
    paths: {
      '/pets': {
        get: {
          security: [{ petsSecurityScheme: ['read:pets'] }]
        },
        post: {
          security: [{ petsSecurityScheme: ['write:pets'] }]
        }
      }
    },
    components: {
      securitySchemes: {
        petsSecurityScheme: {
          type: 'oauth2',
          flows: {
            implicit: {
              authorizationUrl: 'https://example.org/api/oauth/dialog',
              scopes: {
                'write:pets': 'modify pets in your account',
                'read:pets': 'read your pets'
              }
            }
          }
        }
      }
    },
    security: [
      {
        petstore_auth: ['write:pets', 'read:pets']
      }
    ]
  }
};
```

## @Tags

Open API uses tags to help organize (group or search) your API methods. You can provide them directly in your controller
with the `@Tags` decorator.

It's generally recommended to provide tags for each controller, however you can add additional tags to any method.

In the example below, the `findById` method will be tagged only with `"pets"` from the controller. The `findAll` method,
however, will have both `"pets"` and `"another_tag"` associated with it.

```typescript
@Tags('pets')
@Controller('/pets')
export class PetController {
  @Get('/{id}')
  async findById(@Path() id: string): Promise<Pet> {
    // findById only has "pets" tag
  }

  @Get()
  @Tags('another_tag')
  async findAll(): Promise<Pet[]> {
    // findAll has two tags: "pets" and "another_tag"
  }
}
```
