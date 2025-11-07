const express = require('express');
const ContentController = require('../controllers/ContentController');

function createContentRoutes() {
  const router = express.Router();
  const controller = new ContentController();

  // Public basic content
  router.get('/basic', controller.getBasicContent.bind(controller));

  // Protected content routes (will be protected by middleware)
  router.get('/premium', controller.getPremiumContent.bind(controller));
  router.get('/enterprise', controller.getEnterpriseContent.bind(controller));
  
  // Get specific content item
  router.get('/item/:contentId', controller.getContentItem.bind(controller));
  
  // Audio streaming
  router.get('/stream/audio/:contentId', controller.streamAudio.bind(controller));

  return router;
}

module.exports = createContentRoutes;