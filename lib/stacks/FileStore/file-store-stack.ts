import { Stack, App, aws_s3 as s3, StackProps } from 'aws-cdk-lib';
import { defaultBucketProps } from './util/index';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export class FileStoreStack extends Stack {
  public imagesBucket: s3.IBucket;

  constructor(scope: App, id: string, private props: StackProps) {
    super(scope, id, props);

    this.createOriginalFilesBucket();
  }

  private createOriginalFilesBucket() {
    const imagesBucket = new s3.Bucket(this, `OriginalFilesBucket`, {
      ...defaultBucketProps,
    });
    this.imagesBucket = imagesBucket;

    this.exportValue(imagesBucket.bucketName); // @TODO remove at some point

    // Store a reference for Lambdas to import at runtime
    new StringParameter(imagesBucket, 'StringParameter', {
      parameterName: `/posts/${process.env.ENV_NAME}/buckets/original_files`,
      stringValue: imagesBucket.bucketName,
    });
  }
}
