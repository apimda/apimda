import { Code, LayerVersion, LayerVersionProps } from 'aws-cdk-lib/aws-lambda';
import { execSync } from 'child_process';
import { Construct } from 'constructs';
import * as fs from 'fs';
import path from 'path';

/**
 * Properties for the NpmLayerVersion construct.
 */
export interface NpmLayerVersionProps {
  /**
   * Path to the layer code folder containing nodejs/package.json.
   */
  layerPath: string;

  /**
   * Layer version props to use to create the layer.
   */
  layerVersionProps?: Omit<LayerVersionProps, 'code'>;
}

/**
 * A lambda layer (LayerVersion) that is generated from package.json using npm.
 */
export class NpmLayerVersion extends Construct {
  /**
   * List of dependencies that were be packaged into the layer.
   */
  public packagedDependencies: string[];

  /**
   * The lambda layer.
   */
  public layerVersion: LayerVersion;

  constructor(scope: Construct, id: string, props: NpmLayerVersionProps) {
    super(scope, id);

    const pkgFile = path.resolve(`${props.layerPath}/nodejs/package.json`);
    if (!fs.existsSync(pkgFile)) {
      throw new Error(`Package file ${props.layerPath}/nodejs/package.json does not exist`);
    }

    const cwd = `${path.dirname(pkgFile)}`;
    execSync('npm i --production', { cwd });

    const pkgJson = JSON.parse(execSync('npm ls --production --json', { cwd, encoding: 'utf8' }));
    this.packagedDependencies = Object.keys(pkgJson['dependencies']);

    this.layerVersion = new LayerVersion(scope, `${id}LayerVersion`, {
      ...props.layerVersionProps,
      code: Code.fromAsset(props.layerPath)
    });
  }
}
