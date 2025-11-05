const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  signatureVersion: 'v4'
});

const mediaConvert = new AWS.MediaConvert({
  endpoint: process.env.MEDIACONVERT_ENDPOINT,
  apiVersion: '2017-08-29'
});

const cloudFront = new AWS.CloudFront.Signer(
  process.env.CLOUDFRONT_KEY_PAIR_ID,
  require('fs').readFileSync(process.env.CLOUDFRONT_PRIVATE_KEY_PATH || './keys/cloudfront-private-key.pem', 'utf8')
);

module.exports = {
  s3,
  mediaConvert,
  cloudFront,
  AWS
};
