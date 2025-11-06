import { Router } from 'express';
import articleRoutes from './article.routes';
import categoryRoutes from './category.routes';
import tagRoutes from './tag.routes';
import favoriteRoutes from './favorite.routes';

const router = Router();

router.use('/articles', articleRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/favorites', favoriteRoutes);

export default router;
