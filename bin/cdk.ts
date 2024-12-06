#!/usr/bin/env node
import 'source-map-support/register';
import { AppStack } from '../lib/stacks/AppStack/AppStack';
import { envNameResolver } from './index';
import { FileStoreStack } from '../lib/stacks/FileStore/file-store-stack';
import * as cdk from 'aws-cdk-lib';

import dotenv from 'dotenv';
import { CloudFrontStack } from '../lib/stacks/CloudFront/cloud-front-stack';
import { OriginAccessIdentityStack } from '../lib/stacks/AccessIdentity/OriginAccessIdentityStack';
dotenv.config();

export const envName = envNameResolver();

/**
 * Vlad account
 */
const env = {
  account: '717034757322',
  region: 'us-east-1',
};

const app = new cdk.App({
  context: {
    // All stacks can access the envName through: this.node.tryGetContext('envName')
    envName,
  },
});

const fileStoreStack = new FileStoreStack(app, `${envName}-filestorage`, {
  env,
});

const oia = new OriginAccessIdentityStack(app, `${envName}-oia`, {
  env,
});

const cloudFrontStack = new CloudFrontStack(app, `${envName}-cloudfront`, {
  env,
  bucket: fileStoreStack.imagesBucket,
  oia,
});

const appStack = new AppStack(app, `${envName}-app`, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  env,
  storage: {
    imagesBucket: fileStoreStack.imagesBucket,
  },
});

appStack.addDependency(fileStoreStack);
cloudFrontStack.addDependency(fileStoreStack);
cloudFrontStack.addDependency(oia);
