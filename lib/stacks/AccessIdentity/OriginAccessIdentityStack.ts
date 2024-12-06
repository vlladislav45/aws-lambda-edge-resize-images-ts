import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BucketPolicy, IBucket } from 'aws-cdk-lib/aws-s3';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';

export class OriginAccessIdentityStack extends Stack {
  private readonly oia: OriginAccessIdentity;

  constructor(scope: Construct, id: string, private props: StackProps) {
    super(scope, id, props);

    this.oia = new OriginAccessIdentity(this, id, {});
  }

  /**
   * Create an "Origin Access Identity" that can be given to CloudFront to
   * communicate security with a "private" S3 bucket
   */
  getOriginAccessIdentity(bucket: IBucket): OriginAccessIdentity {
    // Explicitly add Bucket Policy
    const policyStatement = new PolicyStatement();
    policyStatement.addActions('s3:GetBucket*');
    policyStatement.addActions('s3:GetObject*');
    policyStatement.addActions('s3:PutObject*');
    policyStatement.addActions('s3:List*');
    policyStatement.addResources(bucket.bucketArn);
    policyStatement.addResources(`${bucket.bucketArn}/*`);
    policyStatement.addCanonicalUserPrincipal(
      this.oia.cloudFrontOriginAccessIdentityS3CanonicalUserId,
    );

    // Manually create or update bucket policy to allow this OIA to access files
    if (!bucket.policy) {
      new BucketPolicy(this, `Policy${bucket.bucketName}`, {
        bucket,
        removalPolicy: RemovalPolicy.DESTROY,
      }).document.addStatements(policyStatement);
    } else {
      bucket.policy.document.addStatements(policyStatement);
    }

    return this.oia;
  }
}
