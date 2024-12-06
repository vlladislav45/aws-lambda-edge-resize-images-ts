'use strict';

// defines the allowed dimensions, default dimensions and how much variance from allowed
// dimension is allowed.

import * as querystring from 'querystring';

const variables = {
  allowedDimension: [
    { w: 352, h: 240 },
    { w: 480, h: 360 },
    { w: 858, h: 480 },
    { w: 1280, h: 720 },
    { w: 1920, h: 1080 },
  ],
  defaultDimension: { w: 352, h: 240 },
  variance: 20,
  webpExtension: 'webp',
};

/**
 * For example, given an input URI pattern ‘pathPrefix/image-name?d=widthxheight’,
 * the transformed URI pattern would be ‘pathPrefix/widthxheight/<requiredFormat>/image-name’ where <requiredFormat>
 * can be webp/jpg as per the request ‘Accept’ header.
 */
exports.handler = (event: any, context: any, callback: any) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  // parse the querystrings key-value pairs. In our case it would be d=100x100
  const params = querystring.parse(request.querystring);

  // fetch the uri of original image
  let fwdUri = request.uri;

  // if there is no dimension attribute, just pass the request
  if (!params.d) {
    callback(null, request);
    return;
  }
  // read the dimension parameter value = width x height and split it by 'x'
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const dimensionMatch = params.d.split('x');

  // set the width and height parameters
  let width = dimensionMatch[0];
  let height = dimensionMatch[1];

  // parse the prefix, image name and extension from the uri.
  // In our case /resized/image

  const match = fwdUri.match(/(.*)\/(.*)\.(.*)/);

  const prefix = match[1];
  const imageName = match[2];
  const extension = match[3];

  // define variable to be set to true if requested dimension is allowed.
  let matchFound = false;

  // calculate the acceptable variance. If image dimension is 105 and is within acceptable
  // range, then in our case, the dimension would be corrected to 100.
  const variancePercent = variables.variance / 100;

  for (const dimension of variables.allowedDimension) {
    const minWidth = dimension.w - dimension.w * variancePercent;
    const maxWidth = dimension.w + dimension.w * variancePercent;
    if (width >= minWidth && width <= maxWidth) {
      width = dimension.w;
      height = dimension.h;
      matchFound = true;
      break;
    }
  }
  // if no match is found from allowed dimension with variance then set to default
  //dimensions.
  if (!matchFound) {
    width = variables.defaultDimension.w;
    height = variables.defaultDimension.h;
  }

  // read the accept header to determine if webP is supported.
  // const accept = headers['accept'] ? headers['accept'][0].value : '';

  const url = [];
  // build the new uri to be forwarded upstream
  url.push(prefix);
  url.push(width + 'x' + height);

  // check support for webp
  // if (accept.includes(variables.webpExtension)) {
  //   url.push(variables.webpExtension);
  // }
  url.push(extension);
  url.push(imageName + '.' + extension);

  fwdUri = url.join('/');

  // final modified url is of format /images/200x200/webp/image.jpg
  request.uri = fwdUri;
  callback(null, request);
};
