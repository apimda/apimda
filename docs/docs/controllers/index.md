# Controllers

Controllers are typescript classes that are decorated with `@Controller()`. Instance methods on a controller class can
handle incoming requests. For example, the `hello` method below will handle requests to `GET /sample/hello`:

```typescript
@Controller('/sample')
class SampleController {
  @Get('/hello')
  async hello(): Promise<string> {
    return 'hi from apimda!';
  }
}
```

It's pretty much that simple. The rest of this section will describe in detail how apimda handles requests and
responses.

:::info Declarative REST APIs

Creating REST APIs from code-based metadata is a well-established pattern that's been implemented in many languages
and libraries, for example:

- Java ([Dropwizard](https://www.dropwizard.io/)
  , [Spring MVC](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html), ...)
- Python ([Flask](https://palletsprojects.com/p/flask/), [FastAPI](https://fastapi.tiangolo.com/), ...)
- C# ([ASP.NET MVC](https://docs.microsoft.com/aspnet/mvc/), ...)
- Node ([NestJS](https://docs.nestjs.com/), ...)
- ...and plenty more

While this might not be the right paradigm for all web requests, it handles a large subset of them rather elegantly. We
find it an especially nice fit for the kind of APIs that are well-suited to be deployed as serverless functions.

Developers that are familiar with any one of these other libraries should find apimda straightforward and simple to work
with. As always, if you notice a discrepancy or missing feature, we welcome [contributions](/docs/contributions)!

:::
