import { Construct } from 'constructs';
import { RestApi as ApiGateway } from 'aws-cdk-lib/aws-apigateway';

export class RestApi extends Construct {
  public readonly api: ApiGateway;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.api = new ApiGateway(this, 'RestApi', {
      restApiName: this.node.tryGetContext('envName') + '-apis',
      defaultCorsPreflightOptions: {
        allowHeaders: ['*'],
        allowMethods: ['*'],
        allowOrigins: ['*'],
        disableCache: true,
        allowCredentials: false,
      },
    });
  }
}
