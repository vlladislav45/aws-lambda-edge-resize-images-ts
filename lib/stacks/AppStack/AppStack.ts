import { Stack, StackProps } from 'aws-cdk-lib';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface Props extends StackProps {
  storage: {
    imagesBucket: IBucket;
  };
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, private props?: Props) {
    super(scope, id, props);
    // The code that defines your stack goes here

    // Create the API Gateway + generic endpoints (login, register, presigned URLs)
    // const api = new RestApi(this, `RestApis`);

    // Create endpoints for CRUD operations
    // new ImageEndpoints(this, 'ImageEndpoints', {
    //   api: api.api,
    // });
  }
}
