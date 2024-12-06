import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

const lambdaPropsDefaults: NodejsFunctionProps = {
  bundling: {
    minify: false, // minify code, defaults to false
    // sourceMap: true, // include source map, defaults to false
    target: 'node18.11', // target environment for the generated JavaScript code
  },
  environment: {
    // NODE_OPTIONS: "--enable-source-maps",
  },
};

export class LambdaNodeFn extends NodejsFunction {
  constructor(
    scope: Construct,
    id: string,
    private props: NodejsFunctionProps,
  ) {
    super(scope, id, Object.assign(lambdaPropsDefaults, props));
  }
}
