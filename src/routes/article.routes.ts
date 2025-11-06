import { Router } from 'express';
import { articleController } from '../controllers/article.controller';

const router = Router();

router.get('/', articleController.getArticles.bind(articleController));
router.get('/search', articleController.searchArticles.bind(articleController));
router.get('/personalized/:userId', articleController.getPersonalizedArticles.bind(articleController));
router.get('/category/:categoryId', articleController.getArticlesByCategory.bind(articleController));
router.get('/tag/:tagId', articleController.getArticlesByTag.bind(articleController));
router.get('/:id', articleController.getArticleById.bind(articleController));
router.get('/slug/:slug', articleController.getArticleBySlug.bind(articleController));
router.post('/', articleController.createArticle.bind(articleController));
router.put('/:id', articleController.updateArticle.bind(articleController));
router.delete('/:id', articleController.deleteArticle.bind(articleController));

export default router;
