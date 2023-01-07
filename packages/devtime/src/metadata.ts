import { PathInfo, RuntimeApp, RuntimeController, RuntimeInput, RuntimeOutput, RuntimeRoute } from '@apimda/runtime';
import path from 'path';
import { Schema } from 'ts-json-schema-generator';
import {
  BodyableNode,
  ClassDeclaration,
  DecoratableNode,
  Decorator,
  JSDocableNode,
  MethodDeclaration,
  Node,
  ParameterDeclaration,
  Project,
  SourceFile,
  StringLiteral,
  SyntaxKind,
  TypeFormatFlags
} from 'ts-morph';
import { SchemaCreator, SchemaRepository } from './schemas';
import { validateMetadata } from './validation';

export enum InputLocation {
  Request = 'request',
  Body = 'body',
  Query = 'query',
  Path = 'path',
  Header = 'header',
  Cookie = 'cookie'
}

export enum RouteMethod {
  Get = 'get',
  Put = 'put',
  Post = 'post',
  Patch = 'patch',
  Delete = 'delete'
}

export enum ApimdaDecorator {
  Controller = 'Controller',
  Get = 'Get',
  Put = 'Put',
  Post = 'Post',
  Patch = 'Patch',
  Delete = 'Delete',
  Request = 'Request',
  Body = 'Body',
  Path = 'Path',
  Query = 'Query',
  Header = 'Header',
  Cookie = 'Cookie',
  Tags = 'Tags',
  Produces = 'Produces',
  Env = 'Env',
  Init = 'Init'
}

function getStringValue(node: Node): string {
  const stringLiteral =
    node.asKind(SyntaxKind.StringLiteral) ??
    node
      .asKind(SyntaxKind.Identifier)
      ?.getSymbol()
      ?.getValueDeclaration()
      ?.asKind(SyntaxKind.VariableDeclaration)
      ?.getInitializer()
      ?.asKind(SyntaxKind.StringLiteral);

  if (stringLiteral) {
    return stringLiteral.getLiteralText();
  }
  throw new Error('Only string literals and simple variable declarations are supported in decorators');
}

function firstArgAsString(decorator?: Decorator): string | undefined {
  const [arg] = decorator?.getArguments() || [];
  if (!arg) {
    return undefined;
  }

  return getStringValue(arg);
}

function descForParam(param: ParameterDeclaration): string | undefined {
  return (param.getParent() as JSDocableNode)
    .getJsDocs()
    .at(0)
    ?.getTags()
    ?.find(t => t.getTagName() === 'param' && t.getText().startsWith(`@param ${param.getName()}`))
    ?.getCommentText();
}

function extractTags(node: DecoratableNode) {
  const args = node.getDecorator(ApimdaDecorator.Tags)?.getArguments();
  return (args || []).map(a => (a as StringLiteral).getLiteralValue());
}

export class AppMetadata {
  static fromTsConfig(tsConfigPath: string, generateSchemas: boolean = true, validate: boolean = true): AppMetadata {
    const project = new Project({
      tsConfigFilePath: tsConfigPath
    });

    const result = new AppMetadata();
    for (const sourceFile of project.getSourceFiles()) {
      for (const clazz of sourceFile.getClasses()) {
        const controller = ControllerMetadata.fromClass(clazz, sourceFile, result);
        if (controller) result.controllers.push(controller);
      }
    }

    if (generateSchemas) {
      const creator = SchemaCreator.fromTsConfig(tsConfigPath);
      result.controllers
        .flatMap(c => c.routes)
        .flatMap(r => r.inputsAndOutputs)
        .forEach(inout => {
          const schemaKey = inout.schemaKey;
          const schemaType = inout.declaredTypeName;
          if (schemaKey && schemaType) {
            creator.add(schemaKey, schemaType);
          }
        });
      result.schemas = creator.result;
    }

    if (validate) {
      const validationResult = validateMetadata(result);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage);
      }
    }
    return result;
  }

  public readonly controllers: ControllerMetadata[] = [];
  public schemas?: SchemaRepository;

  get uniqueTags(): string[] {
    return Array.from(
      this.controllers
        .flatMap(c => c.tags.concat(c.routes.flatMap(r => r.tags)))
        .reduce((set, tag) => set.add(tag), new Set<string>())
    );
  }

  findController(className: string): ControllerMetadata | undefined {
    return this.controllers.find(c => c.className === className);
  }

  findRoute(className: string, classMethodName: string): RouteMetadata | undefined {
    return this.findController(className)?.findRoute(classMethodName);
  }

  findRouteByPath(path: string): RouteMetadata | undefined {
    return this.controllers.flatMap(c => c.routes).find(r => r.path === path);
  }

  findSuccessOutput(className: string, classMethodName: string): OutputMetadata | undefined {
    return this.findController(className)?.findRoute(classMethodName)?.successOutput;
  }

  findInput(className: string, classMethodName: string, declaredArgName: string): InputMetadata | undefined {
    return this.findController(className)?.findRoute(classMethodName)?.findInput(declaredArgName);
  }

  get runtimeApp(): RuntimeApp {
    return {
      schemas: this.schemas?.copy() ?? {},
      controllers: this.controllers.map(c => c.runtimeController)
    };
  }
}

export class ControllerMetadata {
  static fromClass(clazz: ClassDeclaration, sourceFile: SourceFile, app: AppMetadata): ControllerMetadata | undefined {
    if (clazz.getDecorator(ApimdaDecorator.Controller)) {
      const name = clazz.getName()!;
      const basePath = firstArgAsString(clazz.getDecorator(ApimdaDecorator.Controller)) || '';

      const noArgCtor = clazz.getConstructors().find(ctor => {
        return ctor.getParameters().find(p => !p.isOptional() && !p.getDecorator(ApimdaDecorator.Env)) === undefined;
      });
      if (!noArgCtor && clazz.getConstructors().length > 0) {
        throw new Error(`Constructor for class ${name} has required arguments in constructor.`);
      }
      const envByCtor = clazz.getConstructors().map(ctor => {
        return ctor.getParameters().flatMap(p => {
          const envDec = p.getDecorator(ApimdaDecorator.Env);
          return envDec ? [firstArgAsString(envDec)!] : [];
        });
      });
      if (envByCtor.length > 1) {
        throw new Error(`Only one constructor with @Env is allowed per class, found ${envByCtor.length} in ${name}`);
      }
      const ctorEnvNames = envByCtor.length ? envByCtor[0] : [];

      const initMethods = clazz.getInstanceMethods().filter(m => m.getDecorator(ApimdaDecorator.Init));
      if (initMethods.length > 1) {
        throw new Error(`Only one @Init method is allowed per controller, found ${initMethods.length} in ${name}`);
      }
      const initMethod = initMethods.length === 1 ? initMethods[0] : undefined;
      if (initMethod) {
        if (!initMethod.isAsync()) {
          throw new Error(`@Init method ${initMethod.getName()} in ${name} must be marked as 'async'`);
        }
        const requiredParams = initMethod.getParameters().filter(p => !p.isOptional());
        if (requiredParams.length > 0) {
          throw new Error(`@Init method ${initMethod.getName()} in ${name} has required params`);
        }
      }
      const initMethodName = initMethod ? initMethod.getName() : undefined;

      const result = new ControllerMetadata(
        app,
        sourceFile.getFilePath(),
        name,
        basePath,
        extractTags(clazz),
        ctorEnvNames,
        initMethodName
      );

      for (const method of clazz.getInstanceMethods()) {
        const route = RouteMetadata.fromMethod(method, result);
        if (route) result.routes.push(route);
      }

      return result;
    }
    return undefined;
  }

  public readonly routes: RouteMetadata[] = [];

  private constructor(
    public readonly app: AppMetadata,
    public readonly sourceFile: string,
    public readonly className: string,
    public readonly basePath: string,
    public readonly tags: string[],
    public readonly ctorEnvNames: string[],
    public readonly initMethodName?: string
  ) {}

  get moduleName(): string {
    return path.join(path.dirname(this.sourceFile), path.basename(this.sourceFile, path.extname(this.sourceFile)));
  }

  findRoute(classMethodName: string): RouteMetadata | undefined {
    return this.routes.find(r => r.classMethodName === classMethodName);
  }

  get schemaKeys(): string[] {
    return this.routes.flatMap(r => r.schemaKeys);
  }

  get schemas(): Record<string, Schema> {
    return this.app.schemas?.copy(undefined, this.schemaKeys) ?? {};
  }

  get runtimeApp(): RuntimeApp {
    return {
      schemas: this.schemas,
      controllers: [this.runtimeController]
    };
  }

  get runtimeController(): RuntimeController {
    return {
      moduleName: this.moduleName,
      className: this.className,
      ctorEnvNames: this.ctorEnvNames,
      initMethodName: this.initMethodName,
      routes: this.routes.map(r => r.runtimeRoute)
    };
  }
}

export class RouteMetadata {
  static fromMethod(method: MethodDeclaration, controller: ControllerMetadata): RouteMetadata | undefined {
    const routeDecorator =
      method.getDecorator(ApimdaDecorator.Get) ||
      method.getDecorator(ApimdaDecorator.Post) ||
      method.getDecorator(ApimdaDecorator.Put) ||
      method.getDecorator(ApimdaDecorator.Patch) ||
      method.getDecorator(ApimdaDecorator.Delete);

    if (routeDecorator) {
      if (!method.isAsync()) {
        throw new Error(`Route method ${method.getName()} must be async`);
      }
      const localPath = firstArgAsString(routeDecorator) || '';
      const summary = method
        .getJsDocs()
        .at(0)
        ?.getTags()
        .find(t => t.getTagName() === 'summary')
        ?.getCommentText();
      const description = method.getJsDocs().at(0)?.getDescription()?.trim();

      const result = new RouteMetadata(
        controller,
        method.getName(),
        routeDecorator.getName().toLowerCase() as RouteMethod,
        localPath,
        extractTags(method),
        description,
        summary
      );

      for (const param of method.getParameters()) {
        result.inputs.push(InputMetadata.fromParameter(param, result));
      }
      result.successOutput = OutputMetadata.successOutputFromMethod(method, result);
      result.errorOutputs = OutputMetadata.errorOutputsFromMethod(method, result.inputs.length > 0, result);
      return result;
    }
    return undefined;
  }

  public readonly inputs: InputMetadata[] = [];
  public successOutput!: OutputMetadata;
  public errorOutputs!: OutputMetadata[];

  private constructor(
    public readonly controller: ControllerMetadata,
    public readonly classMethodName: string,
    public readonly method: RouteMethod,
    public readonly localPath: string,
    public readonly tags: string[],
    public readonly description?: string,
    public readonly summary?: string
  ) {}

  get outputs(): OutputMetadata[] {
    return this.errorOutputs.concat(this.successOutput);
  }

  get inputsAndOutputs(): Array<InputMetadata | OutputMetadata> {
    return new Array<InputMetadata | OutputMetadata>().concat(this.inputs).concat(this.outputs);
  }

  get path(): string {
    const result = this.controller.basePath + this.localPath;
    if (result === '') {
      return '/';
    }
    return result;
  }

  get pathInfo(): PathInfo {
    return PathInfo.parse(this.path);
  }

  get schemaKeys(): string[] {
    return this.inputsAndOutputs.flatMap(p => (p.schemaKey ? [p.schemaKey] : []));
  }

  get schemas(): Record<string, Schema> {
    return this.controller.app.schemas?.copy(undefined, this.schemaKeys) ?? {};
  }

  findInput(declaredArgName: string): InputMetadata | undefined {
    return this.inputs.find(i => i.declaredArgName === declaredArgName);
  }

  get runtimeApp(): RuntimeApp {
    return {
      schemas: this.schemas,
      controllers: [this.controller.runtimeController]
    };
  }

  get runtimeRoute(): RuntimeRoute {
    return {
      method: this.method,
      path: this.path,
      inputs: this.inputs.map(i => i.runtimeInput),
      successOutput: this.successOutput.runtimeOutput,
      classMethodName: this.classMethodName
    };
  }
}

export class InputMetadata {
  static fromParameter(param: ParameterDeclaration, route: RouteMetadata): InputMetadata {
    const inputDecorator =
      param.getDecorator(ApimdaDecorator.Request) ||
      param.getDecorator(ApimdaDecorator.Body) ||
      param.getDecorator(ApimdaDecorator.Path) ||
      param.getDecorator(ApimdaDecorator.Query) ||
      param.getDecorator(ApimdaDecorator.Header) ||
      param.getDecorator(ApimdaDecorator.Cookie);

    if (inputDecorator) {
      const customName = inputDecorator.getName() !== 'Body' ? firstArgAsString(inputDecorator) : undefined;
      const name = customName || param.getName();
      const location = inputDecorator.getName().toLowerCase() as InputLocation;
      const required = !param.isOptional();
      const mimeType = firstArgAsString(param.getDecorator(ApimdaDecorator.Body));
      const declaredArgName = param.getName();
      const declaredTypeName = param.getStructure().type as string;
      if (param.getType().isClass()) {
        throw new Error(`Input param ${name} is a class. Classes cannot be used for input parameters.`);
      }

      return new InputMetadata(
        route,
        name,
        location,
        required,
        declaredArgName,
        declaredTypeName,
        mimeType,
        descForParam(param)
      );
    }
    throw new Error(`Undecorated parameter:${param.getName()} in route method not allowed`);
  }

  private constructor(
    public readonly route: RouteMetadata,
    public readonly name: string,
    public readonly location: InputLocation,
    public readonly required: boolean,
    public readonly declaredArgName: string,
    public readonly declaredTypeName: string,
    public readonly mimeType?: string,
    public readonly description?: string
  ) {}

  get hasSchema(): boolean {
    return this.location !== InputLocation.Request && this.declaredTypeName !== 'Buffer';
  }

  get schemaKey(): string | undefined {
    if (this.hasSchema) {
      return `${this.route.controller.className}_${this.route.classMethodName}_${this.declaredArgName}`;
    }
    return undefined;
  }

  get runtimeInput(): RuntimeInput {
    return {
      name: this.name,
      location: this.location,
      required: this.required,
      schemaKey: this.schemaKey,
      declaredTypeName: this.declaredTypeName
    };
  }
}

export class OutputMetadata {
  static successOutputFromMethod(method: MethodDeclaration, route: RouteMetadata): OutputMetadata {
    let returnType = method.getReturnType();
    let apimdaResult = false;
    if (method.isAsync() && returnType.getSymbol()?.getName() === 'Promise') {
      returnType = returnType.getTypeArguments()[0];
    }

    if (returnType.getAliasSymbol()?.getName() === 'ApimdaResult') {
      returnType = returnType.getAliasTypeArguments()[0];
      apimdaResult = true;
    }

    let declaredTypeName: string | undefined = returnType.getText(method, TypeFormatFlags.UseFullyQualifiedType);
    if (declaredTypeName === 'void' || returnType.getSymbol()?.getName() === 'APIGatewayProxyStructuredResultV2') {
      declaredTypeName = undefined;
    }

    if (returnType.isClass()) {
      throw new Error(`Return type for ${method.getName()} is a class. Classes cannot be used for return parameters.`);
    }

    const mimeType = firstArgAsString(method.getDecorator(ApimdaDecorator.Produces));

    const description = method
      .getJsDocs()
      .at(0)
      ?.getTags()
      .find(t => ['return', 'returns'].includes(t.getTagName()))
      ?.getCommentText();

    return new OutputMetadata(route, 200, mimeType, declaredTypeName, description, apimdaResult);
  }

  static errorOutputsFromMethod(method: MethodDeclaration, hasInputs: boolean, route: RouteMetadata): OutputMetadata[] {
    const errorCodes = new Set<number>();
    if (hasInputs) {
      errorCodes.add(400);
    }
    const typeChecker = method.getProject().getTypeChecker();
    const queue = new Array<BodyableNode>(method);
    const processed = new Set<BodyableNode>();
    while (queue.length > 0) {
      const current = queue.pop()!;
      if (!processed.has(current)) {
        processed.add(current);
        if (current.hasBody()) {
          const called = current
            .getBody()!
            .getDescendantsOfKind(SyntaxKind.CallExpression)
            .flatMap(ex => {
              const decl = typeChecker.getResolvedSignature(ex)?.getDeclaration();
              return Node.isBodyable(decl) ? [decl as BodyableNode] : [];
            });
          queue.push(...called);

          const bodyText = current.getBodyText()!;
          const httpErrorRegex = /throw\s+new\s+HttpError\s*\(\s*(\d+).*\)/g;
          let match = httpErrorRegex.exec(bodyText);
          while (match !== null) {
            errorCodes.add(parseInt(match[1]));
            match = httpErrorRegex.exec(bodyText);
          }
        }
      }
    }

    return Array.from(errorCodes).map(statusCode => {
      return new OutputMetadata(route, statusCode);
    });
  }

  private constructor(
    public readonly route: RouteMetadata,
    public readonly statusCode: number,
    public readonly mimeType?: string,
    public readonly declaredTypeName?: string,
    public readonly description?: string,
    public readonly apimdaResult?: boolean
  ) {}

  get hasSchema(): boolean {
    return this.declaredTypeName !== undefined && this.declaredTypeName !== 'Buffer';
  }

  get schemaKey(): string | undefined {
    if (this.hasSchema) {
      return `${this.route.controller.className}_${this.route.classMethodName}_return`;
    }
    return undefined;
  }

  get runtimeOutput(): RuntimeOutput {
    return {
      statusCode: this.statusCode,
      mimeType: this.mimeType,
      declaredTypeName: this.declaredTypeName,
      apimdaResult: this.apimdaResult
    };
  }
}
