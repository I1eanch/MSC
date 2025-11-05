const { s3 } = require('../config/aws');
const logger = require('../utils/logger');

const deleteVideoFromS3 = async (bucket, key) => {
  try {
    await s3.deleteObject({
      Bucket: bucket,
      Key: key
    }).promise();

    logger.info(`Deleted S3 object: ${key} from bucket: ${bucket}`);
  } catch (error) {
    logger.error(`Error deleting S3 object: ${key}`, error);
    throw error;
  }
};

const getVideoMetadata = async (bucket, key) => {
  try {
    const metadata = await s3.headObject({
      Bucket: bucket,
      Key: key
    }).promise();

    return metadata;
  } catch (error) {
    logger.error(`Error getting video metadata: ${key}`, error);
    throw error;
  }
};

const copyVideo = async (sourceBucket, sourceKey, destBucket, destKey) => {
  try {
    await s3.copyObject({
      CopySource: `${sourceBucket}/${sourceKey}`,
      Bucket: destBucket,
      Key: destKey
    }).promise();

    logger.info(`Copied video from ${sourceKey} to ${destKey}`);
  } catch (error) {
    logger.error('Error copying video:', error);
    throw error;
  }
};

module.exports = {
  deleteVideoFromS3,
  getVideoMetadata,
  copyVideo
};
