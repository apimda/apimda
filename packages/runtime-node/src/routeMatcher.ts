import { PathInfo } from '@apimda/runtime';

interface RouteMatch {
  path: string;
  pathParameters: Record<string, string>;
}

export class RouteMatcher {
  public routePaths: PathInfo[] = [];

  add(routePath: string) {
    this.routePaths.push(PathInfo.parse(routePath));
    this.routePaths.sort((pathA, pathB) => {
      const a = pathA.normalizedPath;
      const b = pathB.normalizedPath;
      return a > b ? 1 : a < b ? -1 : 0;
    });
  }

  match(requestPath: string): RouteMatch | undefined {
    for (const routePath of this.routePaths) {
      const pathParameters = routePath.match(requestPath);
      if (pathParameters) {
        return {
          path: routePath.path,
          pathParameters
        };
      }
    }
    return undefined;
  }
}
