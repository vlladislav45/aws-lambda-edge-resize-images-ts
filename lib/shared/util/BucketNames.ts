import { SSM } from 'aws-sdk';

interface Cache {
  [key: string]: string;
}

class BucketNames {
  private static cachedParameters: Cache = {};

  static async getSsmParameter(paramName: string): Promise<string> {
    // Check for Cache Hit
    if (this.cachedParameters[paramName]) {
      return this.cachedParameters[paramName];
    }

    // Retrieve from AWS SSM Parameter Store
    const ssm = new SSM({ region: 'us-east-1' });
    // const params = await ssm.getParameters().promise();
    // console.log('list', JSON.stringify(params.Parameters, null, 2));

    const param = await ssm
      .getParameter({
        Name: paramName,
        WithDecryption: true,
      })
      .promise();

    if (!param.Parameter?.Value) {
      throw new Error(
        `Can not resolve bucket name from SSM parameter: ${paramName}`,
      );
    }

    // Cache for future lookups
    this.cachedParameters[paramName] = param.Parameter?.Value;

    console.log('PArameter', param?.Parameter);

    return param?.Parameter?.Value;
  }
}

export async function getOriginalFiles(): Promise<string> {
  //https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html
  // const paramName = `/posts/${process.env.ENV_NAME}/buckets/original_files`;
  const paramName = `/posts/prod/buckets/original_files`;

  return BucketNames.getSsmParameter(paramName);
}
