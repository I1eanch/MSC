const { cloudFront } = require('../config/aws');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('../utils/logger');

const generateSignedUrl = async (resourceUrl, expirySeconds = 3600) => {
  try {
    if (!cloudFront) {
      logger.warn('CloudFront signing not configured, returning unsigned URL');
      const fallbackUrl = resourceUrl + `?expires=${Math.floor(Date.now() / 1000) + expirySeconds}`;
      return fallbackUrl;
    }

    const expireTime = Math.floor(Date.now() / 1000) + expirySeconds;

    const signedUrl = cloudFront.getSignedUrl({
      url: resourceUrl,
      expires: expireTime
    });

    return signedUrl;
  } catch (error) {
    logger.error('Error generating signed URL:', error);
    
    const fallbackUrl = resourceUrl + `?expires=${Math.floor(Date.now() / 1000) + expirySeconds}`;
    return fallbackUrl;
  }
};

const generateDRMToken = (videoId, userId) => {
  const payload = {
    videoId,
    userId,
    timestamp: Date.now(),
    deviceId: crypto.randomBytes(16).toString('hex')
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.SIGNED_URL_EXPIRY ? `${process.env.SIGNED_URL_EXPIRY}s` : '1h'
  });

  return token;
};

const verifyDRMToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, payload: decoded };
  } catch (error) {
    logger.warn('Invalid DRM token:', error.message);
    return { valid: false, error: error.message };
  }
};

const generatePlaybackPolicy = (videoId, userId, restrictions = {}) => {
  const policy = {
    videoId,
    userId,
    allowedIPs: restrictions.allowedIPs || [],
    maxPlaybacks: restrictions.maxPlaybacks || null,
    expiresAt: restrictions.expiresAt || null,
    deviceLimit: restrictions.deviceLimit || 3,
    geoRestrictions: restrictions.geoRestrictions || [],
    timestamp: Date.now()
  };

  const policyString = JSON.stringify(policy);
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(policyString)
    .digest('hex');

  return {
    policy: Buffer.from(policyString).toString('base64'),
    signature
  };
};

const verifyPlaybackPolicy = (policyBase64, signature) => {
  try {
    const policyString = Buffer.from(policyBase64, 'base64').toString('utf8');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.JWT_SECRET)
      .update(policyString)
      .digest('hex');

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' };
    }

    const policy = JSON.parse(policyString);

    if (policy.expiresAt && policy.expiresAt < Date.now()) {
      return { valid: false, error: 'Policy expired' };
    }

    return { valid: true, policy };
  } catch (error) {
    logger.error('Error verifying playback policy:', error);
    return { valid: false, error: error.message };
  }
};

module.exports = {
  generateSignedUrl,
  generateDRMToken,
  verifyDRMToken,
  generatePlaybackPolicy,
  verifyPlaybackPolicy
};
