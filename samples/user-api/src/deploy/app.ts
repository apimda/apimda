import * as cdk from 'aws-cdk-lib';
import { UserApiStack } from './userApiStack';

const app = new cdk.App();
new UserApiStack(app, 'UserApiStack', {});
