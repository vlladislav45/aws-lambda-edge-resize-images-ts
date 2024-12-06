'use strict';

import { S3 } from 'aws-sdk';
import * as querystring from 'querystring';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Sharp = require('sharp');

import { getOriginalFiles } from '../../../../shared/util/BucketNames';

exports.handler = async (event: any, context: any, callback: any) => {
  const response = event.Records[0].cf.response;

  console.log('Response status code :%s', response.status);

  //check if image is not present
  if (response.status == 404 || response.status == 403) {
    const request = event.Records[0].cf.request;
    console.log('request', request);
    const params = querystring.parse(request.querystring);

    console.log('params', params);

    // if there is no dimension attribute, just pass the response
    // if (!params.d) {
    //   callback(null, response);
    //   return;
    // }

    // read the dimension parameter value = width x height and split it by 'x'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // const dimensionMatch = params.d.split('x');

    // read the required path. Ex: uri /images/100x100/webp/image.jpg
    const path = request.uri;

    console.log('path', path);

    // read the S3 key from the path variable.
    // Ex: path variable /images/100x100/webp/image.jpg
    const key = decodeURI(path.substring(1));

    console.log('key', key);

    // parse the prefix, width, height and image name
    // Ex: key=images/200x200/webp/image.jpg
    let prefix,
      originalKey,
      match,
      width: number,
      height: number,
      requiredFormat: string,
      imageName;
    let startIndex;

    try {
      match = key.match(/(.*)\/(\d+)x(\d+)\/(.*)\/(.*)/) ?? '';
      console.log('match', match);
      prefix = match[1];
      width = parseInt(match[2], 10);
      height = parseInt(match[3], 10);

      // correction for jpg required for 'Sharp'
      requiredFormat = match[4] == 'jpg' ? 'jpeg' : match[4];
      imageName = match[5];
      originalKey = prefix + '/' + imageName;

      console.log('imageName', imageName);
      console.log('originalKey', originalKey);
    } catch (err) {
      // no prefix exist for image..
      console.log('no prefix present..');
      match = key.match(/(\d+)x(\d+)\/(.*)\/(.*)/) ?? '';
      width = parseInt(match[1], 10);
      height = parseInt(match[2], 10);

      // correction for jpg required for 'Sharp'
      requiredFormat = match[3] == 'jpg' ? 'jpeg' : match[3];
      imageName = match[4];
      originalKey = imageName;

      console.log('ErrimageName', imageName);
      console.log('ErroriginalKey', originalKey);
    }

    const Bucket = await getOriginalFiles();
    // get the source image file
    await new S3()
      .getObject({ Bucket: Bucket, Key: originalKey })
      .promise()
      // perform the resize operation
      .then((data) =>
        Sharp(data.Body).resize(width).toFormat(requiredFormat).toBuffer(),
      )
      .then(async (buffer) => {
        // save the resized object to S3 bucket with appropriate object key.
        await new S3()
          .putObject({
            Body: buffer,
            Bucket: Bucket,
            CacheControl: 'max-age=31536000',
            Key: key,
            StorageClass: 'STANDARD',
          })
          .promise()
          // even if there is exception in saving the object we send back the generated
          // image back to viewer below
          .catch(() => {
            console.log('Exception while writing resized image to bucket');
          });

        // generate a binary response with resized image
        response.status = 200;
        response.body = buffer.toString('base64');
        response.bodyEncoding = 'base64';
        callback(null, response);
      })
      .catch((err) => {
        console.log('Exception while reading source image :%j', err);
      });
  } // end of if block checking response statusCode
  else {
    // allow the response to pass through
    callback(null, response);
  }
};
