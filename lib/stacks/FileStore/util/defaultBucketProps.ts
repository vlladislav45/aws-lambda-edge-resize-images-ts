import { RemovalPolicy } from 'aws-cdk-lib';
import { HttpMethods } from 'aws-cdk-lib/aws-s3';

export default {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: false,
  publicReadAccess: true,
  cors: [
    {
      allowedOrigins: ['*'],
      allowedMethods: [HttpMethods.GET],
      maxAge: 30000,
      exposedHeaders: [
        'x-amz-server-side-encryption',
        'x-amz-request-id',
        'x-amz-id-2',
        'ETag',
      ],
      allowedHeaders: ['*'],
    },
  ],
};
