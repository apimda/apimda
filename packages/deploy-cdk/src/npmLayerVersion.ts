import { Architecture, Code, LayerVersion, LayerVersionProps } from 'aws-cdk-lib/aws-lambda';
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

const AWS_ARCH_TO_NODE_ARCH: Map<Architecture, string> = new Map([
  [Architecture.X86_64, 'x64'],
  [Architecture.ARM_64, 'arm64']
]);

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
    const awsArch = props.layerVersionProps?.compatibleArchitectures ?? [Architecture.X86_64];
    if (awsArch.length != 1) {
      throw new Error(`NpmLayerVersion only supports single-deployment architectures`);
    }
    const nodeArch = AWS_ARCH_TO_NODE_ARCH.get(awsArch[0]);
    if (!nodeArch) {
      throw new Error(`Architecutre '${awsArch}' not supported`);
    }

    execSync(`npm i --omit=dev --platform=linux --arch=${nodeArch}`, { cwd });

    const pkgJson = JSON.parse(execSync('npm ls --omit=dev --json', { cwd, encoding: 'utf8' }));
    this.packagedDependencies = Object.keys(pkgJson['dependencies']);

    this.layerVersion = new LayerVersion(scope, `${id}LayerVersion`, {
      ...props.layerVersionProps,
      code: Code.fromAsset(props.layerPath)
    });
  }
}
