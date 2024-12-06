import { S3 } from 'aws-sdk';

export class S3Helper {
  static async get(fileName: string, bucket: string): Promise<any> {
    const params = {
      Bucket: bucket,
      Key: fileName,
    };

    let data = await new S3().getObject(params).promise();

    if (!data) {
      throw Error(`Failed to get file ${fileName}, from ${bucket}`);
    }

    if (/\.json$/.test(fileName)) {
      data = JSON.parse(data?.Body?.toString() ?? '');
    }
    return data;
  }

  static async write(
    data: any,
    fileName: string,
    bucket: string,
    ACL: string,
    ContentType: string,
  ) {
    const params = {
      Bucket: bucket,
      Body: Buffer.isBuffer(data) ? data : JSON.stringify(data),
      Key: fileName,
      ACL,
      ContentType,
    };
    console.log('params', params);

    const newData = await new S3().putObject(params).promise();

    if (!newData) {
      throw Error('there was an error writing the file');
    }

    return newData;
  }

  static async getPresignedUrl(bucket: string, fileName: string) {
    return await new S3({
      region: 'us-east-1',
      signatureVersion: 'v4',
    }).getSignedUrlPromise('getObject', {
      Bucket: bucket,
      Key: fileName,
    });
  }
}
