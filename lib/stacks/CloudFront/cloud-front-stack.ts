import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  experimental,
  LambdaEdgeEventType,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Code, IVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { OriginAccessIdentityStack } from '../AccessIdentity/OriginAccessIdentityStack';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

interface Props extends StackProps {
  bucket: IBucket;
  oia: OriginAccessIdentityStack;
}

export class CloudFrontStack extends Stack {
  private id: string;

  constructor(scope: Construct, id: string, private props: Props) {
    super(scope, id, props);

    this.id = id;

    this.createDistribution(
      'separeto.com',
      'resizeLambdaEdgeFn',
      'originResizeLambdaEdgeResponseFn',
    );
  }

  /**
   * Without getOriginAccessIdentity won't work the functionality
   */
  private createDistribution(
    domain: string,
    viewRequestHandler: string,
    originResponseHandler: string,
  ): void {
    const distribution = new Distribution(
      this,
      'CloudFrontCacheManagedPolicy',
      {
        defaultBehavior: {
          origin: new S3Origin(this.props.bucket, {
            originAccessIdentity: this.props.oia.getOriginAccessIdentity(
              this.props.bucket,
            ),
          }), // An Origin that is backed by an S3 bucket.
          responseHeadersPolicy: ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
          viewerProtocolPolicy: ViewerProtocolPolicy.ALLOW_ALL,
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachePolicy: CachePolicy.CACHING_OPTIMIZED,
          edgeLambdas: [
            {
              functionVersion: this.responseVersion(originResponseHandler),
              eventType: LambdaEdgeEventType.ORIGIN_RESPONSE,
            },
            {
              functionVersion: this.redirectVersion(viewRequestHandler),
              eventType: LambdaEdgeEventType.VIEWER_REQUEST,
            },
          ],
        },
        // domainNames: [domain],
        enableLogging: true,
      },
    );

    // new CfnOutput(this, domain, { value: distribution.domainName });
  }

  redirectVersion(handler: string): IVersion {
    const redirectFunction = new experimental.EdgeFunction(
      this,
      `${this.id}-${handler}`,
      {
        runtime: Runtime.NODEJS_14_X,
        handler: `${handler}.handler`,
        code: Code.fromAsset(
          path.resolve(
            __dirname,
            './lambdaEdgeFunctions/image-viewer-request-function',
          ),
        ),
        timeout: Duration.seconds(5),
        memorySize: 128,
        logRetention: RetentionDays.ONE_WEEK,
      },
    );

    redirectFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: ['*'],
      }),
    );
    redirectFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['s3:*'],
        resources: ['*'],
      }),
    );

    return redirectFunction.currentVersion;
  }

  responseVersion(handler: string): IVersion {
    const imageOriginResponseLambda: NodejsFunction = new NodejsFunction(
      this,
      `${this.id}-${handler}`,
      {
        bundling: {
          minify: true,
          nodeModules: ['sharp'],
        },
        entry: path.resolve(
          __dirname,
          './lambdaEdgeFunctions/image-origin-response-function/index.ts',
        ),
        functionName: `${this.id}-${handler}`,
        handler: 'handler',
        runtime: Runtime.NODEJS_14_X,
        timeout: Duration.seconds(15),
      },
    );

    imageOriginResponseLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: ['*'],
      }),
    );
    imageOriginResponseLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['s3:*'],
        resources: ['*'],
      }),
    );

    return imageOriginResponseLambda.currentVersion;
  }
}
