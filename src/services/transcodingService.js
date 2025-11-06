const { mediaConvert } = require('../config/aws');
const { run } = require('../database/db');
const logger = require('../utils/logger');

const startTranscoding = async (videoId, inputKey) => {
  try {
    const params = {
      Role: process.env.MEDIACONVERT_ROLE_ARN,
      Settings: {
        Inputs: [
          {
            FileInput: `s3://${process.env.S3_BUCKET_NAME}/${inputKey}`,
            AudioSelectors: {
              'Audio Selector 1': {
                DefaultSelection: 'DEFAULT'
              }
            },
            VideoSelector: {}
          }
        ],
        OutputGroups: [
          {
            Name: 'HLS',
            OutputGroupSettings: {
              Type: 'HLS_GROUP_SETTINGS',
              HlsGroupSettings: {
                Destination: `s3://${process.env.S3_OUTPUT_BUCKET_NAME}/hls/${videoId}/`,
                SegmentLength: 6,
                MinSegmentLength: 0,
                DirectoryStructure: 'SINGLE_DIRECTORY',
                ManifestDurationFormat: 'FLOATING_POINT',
                StreamInfResolution: 'INCLUDE',
                ClientCache: 'ENABLED'
              }
            },
            Outputs: [
              {
                NameModifier: '_1080p',
                VideoDescription: {
                  Width: 1920,
                  Height: 1080,
                  CodecSettings: {
                    Codec: 'H_264',
                    H264Settings: {
                      MaxBitrate: 5000000,
                      RateControlMode: 'QVBR',
                      QvbrSettings: {
                        QvbrQualityLevel: 8
                      }
                    }
                  }
                },
                AudioDescriptions: [
                  {
                    CodecSettings: {
                      Codec: 'AAC',
                      AacSettings: {
                        Bitrate: 128000,
                        CodingMode: 'CODING_MODE_2_0',
                        SampleRate: 48000
                      }
                    }
                  }
                ],
                ContainerSettings: {
                  Container: 'M3U8',
                  M3u8Settings: {}
                }
              },
              {
                NameModifier: '_720p',
                VideoDescription: {
                  Width: 1280,
                  Height: 720,
                  CodecSettings: {
                    Codec: 'H_264',
                    H264Settings: {
                      MaxBitrate: 3000000,
                      RateControlMode: 'QVBR',
                      QvbrSettings: {
                        QvbrQualityLevel: 8
                      }
                    }
                  }
                },
                AudioDescriptions: [
                  {
                    CodecSettings: {
                      Codec: 'AAC',
                      AacSettings: {
                        Bitrate: 128000,
                        CodingMode: 'CODING_MODE_2_0',
                        SampleRate: 48000
                      }
                    }
                  }
                ],
                ContainerSettings: {
                  Container: 'M3U8',
                  M3u8Settings: {}
                }
              },
              {
                NameModifier: '_480p',
                VideoDescription: {
                  Width: 854,
                  Height: 480,
                  CodecSettings: {
                    Codec: 'H_264',
                    H264Settings: {
                      MaxBitrate: 1500000,
                      RateControlMode: 'QVBR',
                      QvbrSettings: {
                        QvbrQualityLevel: 7
                      }
                    }
                  }
                },
                AudioDescriptions: [
                  {
                    CodecSettings: {
                      Codec: 'AAC',
                      AacSettings: {
                        Bitrate: 96000,
                        CodingMode: 'CODING_MODE_2_0',
                        SampleRate: 48000
                      }
                    }
                  }
                ],
                ContainerSettings: {
                  Container: 'M3U8',
                  M3u8Settings: {}
                }
              }
            ]
          },
          {
            Name: 'MP4',
            OutputGroupSettings: {
              Type: 'FILE_GROUP_SETTINGS',
              FileGroupSettings: {
                Destination: `s3://${process.env.S3_OUTPUT_BUCKET_NAME}/mp4/${videoId}/`
              }
            },
            Outputs: [
              {
                NameModifier: '_1080p',
                Extension: 'mp4',
                VideoDescription: {
                  Width: 1920,
                  Height: 1080,
                  CodecSettings: {
                    Codec: 'H_264',
                    H264Settings: {
                      MaxBitrate: 5000000,
                      RateControlMode: 'QVBR'
                    }
                  }
                },
                AudioDescriptions: [
                  {
                    CodecSettings: {
                      Codec: 'AAC',
                      AacSettings: {
                        Bitrate: 128000
                      }
                    }
                  }
                ],
                ContainerSettings: {
                  Container: 'MP4',
                  Mp4Settings: {}
                }
              }
            ]
          },
          {
            Name: 'Thumbnails',
            OutputGroupSettings: {
              Type: 'FILE_GROUP_SETTINGS',
              FileGroupSettings: {
                Destination: `s3://${process.env.S3_OUTPUT_BUCKET_NAME}/thumbnails/${videoId}/`
              }
            },
            Outputs: [
              {
                VideoDescription: {
                  Width: 1280,
                  Height: 720,
                  CodecSettings: {
                    Codec: 'FRAME_CAPTURE',
                    FrameCaptureSettings: {
                      FramerateNumerator: 1,
                      FramerateDenominator: 10,
                      MaxCaptures: 1,
                      Quality: 80
                    }
                  }
                },
                ContainerSettings: {
                  Container: 'RAW'
                }
              }
            ]
          }
        ]
      },
      Queue: process.env.MEDIACONVERT_QUEUE_ARN,
      UserMetadata: {
        videoId: videoId
      }
    };

    const result = await mediaConvert.createJob(params).promise();
    
    logger.info(`MediaConvert job created: ${result.Job.Id} for video ${videoId}`);
    
    return result.Job.Id;
  } catch (error) {
    logger.error('Error starting transcoding:', error);
    throw error;
  }
};

const getJobStatus = async (jobId) => {
  try {
    const result = await mediaConvert.getJob({ Id: jobId }).promise();
    
    const job = result.Job;
    let status = 'processing';
    let progress = 0;

    switch (job.Status) {
      case 'SUBMITTED':
      case 'PROGRESSING':
        status = 'transcoding';
        progress = job.JobPercentComplete || 0;
        break;
      case 'COMPLETE':
        status = 'completed';
        progress = 100;
        
        if (job.UserMetadata && job.UserMetadata.videoId) {
          await saveTranscodedOutputs(job.UserMetadata.videoId, job);
        }
        break;
      case 'CANCELED':
        status = 'canceled';
        break;
      case 'ERROR':
        status = 'failed';
        break;
      default:
        status = 'unknown';
    }

    return {
      status,
      progress,
      jobId
    };
  } catch (error) {
    logger.error('Error getting job status:', error);
    throw error;
  }
};

const saveTranscodedOutputs = async (videoId, job) => {
  try {
    const outputs = [];
    
    const resolutions = ['1080p', '720p', '480p'];
    
    for (const resolution of resolutions) {
      outputs.push({
        video_id: videoId,
        format: 'hls',
        resolution: resolution,
        s3_key: `hls/${videoId}/index_${resolution}.m3u8`,
        s3_bucket: process.env.S3_OUTPUT_BUCKET_NAME,
        cloudfront_url: `https://${process.env.CLOUDFRONT_DOMAIN}/hls/${videoId}/index_${resolution}.m3u8`
      });
    }
    
    outputs.push({
      video_id: videoId,
      format: 'mp4',
      resolution: '1080p',
      s3_key: `mp4/${videoId}/output_1080p.mp4`,
      s3_bucket: process.env.S3_OUTPUT_BUCKET_NAME,
      cloudfront_url: `https://${process.env.CLOUDFRONT_DOMAIN}/mp4/${videoId}/output_1080p.mp4`
    });

    for (const output of outputs) {
      await run(
        `INSERT INTO video_outputs (video_id, format, resolution, s3_key, s3_bucket, cloudfront_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [output.video_id, output.format, output.resolution, output.s3_key, output.s3_bucket, output.cloudfront_url]
      );
    }

    const thumbnailUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/thumbnails/${videoId}/thumbnail.jpg`;
    await run('UPDATE videos SET thumbnail_url = ? WHERE id = ?', [thumbnailUrl, videoId]);

    logger.info(`Saved transcoded outputs for video ${videoId}`);
  } catch (error) {
    logger.error('Error saving transcoded outputs:', error);
  }
};

module.exports = {
  startTranscoding,
  getJobStatus
};
