const { AuditService } = require('../services/AuditService');

class ContentController {
  constructor() {
    // Mock content data
    this.content = {
      basic: [
        { id: '1', title: 'Allan Rayman - Biography', type: 'text', tier: 'freemium' },
        { id: '2', title: 'Public Photos', type: 'gallery', tier: 'freemium' },
        { id: '3', title: 'Basic Music Samples', type: 'audio', tier: 'freemium' }
      ],
      premium: [
        { id: '4', title: 'Exclusive Interview', type: 'video', tier: 'premium' },
        { id: '5', title: 'Behind the Scenes', type: 'video', tier: 'premium' },
        { id: '6', title: 'Unreleased Tracks', type: 'audio', tier: 'premium' },
        { id: '7', title: 'HD Music Videos', type: 'video', tier: 'premium' }
      ],
      enterprise: [
        { id: '8', title: 'Raw Studio Sessions', type: 'audio', tier: 'enterprise' },
        { id: '9', title: 'API Documentation', type: 'document', tier: 'enterprise' },
        { id: '10', title: 'Personal Q&A Session', type: 'video', tier: 'enterprise' }
      ]
    };
  }

  // Get basic content (freemium)
  async getBasicContent(req, res) {
    try {
      const userId = req.user?.id;
      
      AuditService.logAccessAttempt(
        userId,
        'basic_content',
        true,
        'Access granted to basic content'
      );

      res.json({
        content: this.content.basic,
        tier: 'freemium'
      });
    } catch (error) {
      AuditService.logError(error, { action: 'getBasicContent' });
      res.status(500).json({ error: 'Failed to retrieve content' });
    }
  }

  // Get premium content (requires premium subscription)
  async getPremiumContent(req, res) {
    try {
      const userId = req.user?.id;
      
      AuditService.logAccessAttempt(
        userId,
        'premium_content',
        true,
        'Access granted to premium content'
      );

      res.json({
        content: [...this.content.basic, ...this.content.premium],
        tier: 'premium'
      });
    } catch (error) {
      AuditService.logError(error, { action: 'getPremiumContent' });
      res.status(500).json({ error: 'Failed to retrieve content' });
    }
  }

  // Get enterprise content (requires enterprise subscription)
  async getEnterpriseContent(req, res) {
    try {
      const userId = req.user?.id;
      
      AuditService.logAccessAttempt(
        userId,
        'enterprise_content',
        true,
        'Access granted to enterprise content'
      );

      res.json({
        content: [...this.content.basic, ...this.content.premium, ...this.content.enterprise],
        tier: 'enterprise'
      });
    } catch (error) {
      AuditService.logError(error, { action: 'getEnterpriseContent' });
      res.status(500).json({ error: 'Failed to retrieve content' });
    }
  }

  // Get specific content item
  async getContentItem(req, res) {
    try {
      const { contentId } = req.params;
      const userId = req.user?.id;
      
      // Find content across all tiers
      const allContent = [...this.content.basic, ...this.content.premium, ...this.content.enterprise];
      const contentItem = allContent.find(item => item.id === contentId);
      
      if (!contentItem) {
        return res.status(404).json({ error: 'Content not found' });
      }

      AuditService.logAccessAttempt(
        userId,
        `content_${contentId}`,
        true,
        `Access granted to content: ${contentItem.title}`
      );

      res.json({ content: contentItem });
    } catch (error) {
      AuditService.logError(error, { action: 'getContentItem' });
      res.status(500).json({ error: 'Failed to retrieve content' });
    }
  }

  // Stream audio content (with quality based on subscription)
  async streamAudio(req, res) {
    try {
      const { contentId } = req.params;
      const userId = req.user?.id;
      const subscription = req.subscription;
      
      // Determine streaming quality based on subscription
      let quality = 'standard';
      if (subscription && subscription.hasEntitlement('hd_streaming')) {
        quality = 'hd';
      }

      AuditService.logAccessAttempt(
        userId,
        `audio_stream_${contentId}`,
        true,
        `Streaming audio in ${quality} quality`
      );

      // Mock streaming response
      res.json({
        contentId,
        streamUrl: `/api/stream/audio/${contentId}?quality=${quality}`,
        quality,
        format: 'mp3'
      });
    } catch (error) {
      AuditService.logError(error, { action: 'streamAudio' });
      res.status(500).json({ error: 'Failed to stream audio' });
    }
  }
}

module.exports = ContentController;