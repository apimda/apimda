export class PathInfo {
  static parse(path: string) {
    const components = path.split('/');
    const normalizedComponents: string[] = [];
    const pathVars = [];
    for (const component of components) {
      if (component.startsWith('{') && component.endsWith('}')) {
        pathVars.push(component.substring(1, component.length - 1));
        normalizedComponents.push('{}');
      } else {
        normalizedComponents.push(component);
      }
    }
    const normalizedPath = normalizedComponents.join('/');
    return new PathInfo(path, normalizedPath, normalizedComponents, pathVars);
  }

  private readonly pattern: string;

  constructor(
    public path: string,
    public normalizedPath: string,
    public normalizedComponents: string[],
    public pathVars: string[]
  ) {
    this.pattern = '^' + this.normalizedPath.split('{}').join('([^/]*)') + '$';
  }

  /**
   * Returns path variable name/value map if the pattern matches the request path, otherwise undefined.
   * @param requestPath
   */
  match(requestPath: string): Record<string, string> | undefined {
    const requestComponents = requestPath.split('/');
    if (this.normalizedComponents.length != requestComponents.length) {
      return undefined;
    }

    const result: Record<string, string> = {};
    let pathVarIdx = 0;
    for (let i = 0; i < this.normalizedComponents.length; i++) {
      const normalizedComponent = this.normalizedComponents[i];
      const requestComponent = requestComponents[i];
      if (normalizedComponent === '{}') {
        const pathVarName = this.pathVars[pathVarIdx++];
        result[pathVarName] = requestComponent;
      } else if (normalizedComponent !== requestComponent) {
        return undefined;
      }
    }

    if (pathVarIdx !== this.pathVars.length) {
      throw new Error(
        `Error matching '${this.path}'. Expected ${this.pathVars.length} path vars, received ${pathVarIdx}`
      );
    }
    return result;
  }

  /**
   * Returns path variable name/value map if the pattern matches the request path, otherwise undefined.
   * @param requestPath
   */
  regexMatch(requestPath: string): Record<string, string> | undefined {
    const matches = requestPath.match(new RegExp(this.pattern));
    if (matches === null || matches.length < 1) {
      return undefined;
    }
    if (matches.length - 1 !== this.pathVars.length) {
      throw new Error(
        `Error matching '${this.path}'. Expected ${this.pathVars.length} path vars, received ${matches.length}`
      );
    }
    const result: Record<string, string> = {};
    for (let i = 0; i < this.pathVars.length; i++) {
      result[this.pathVars[i]] = matches[i + 1];
    }
    return result;
  }
}
