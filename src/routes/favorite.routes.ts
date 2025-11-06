import { Router } from 'express';
import { favoriteController } from '../controllers/favorite.controller';

const router = Router();

router.post('/', favoriteController.addFavorite.bind(favoriteController));
router.delete('/:userId/:articleId', favoriteController.removeFavorite.bind(favoriteController));
router.get('/:userId', favoriteController.getUserFavorites.bind(favoriteController));
router.get('/:userId/:articleId', favoriteController.checkFavorite.bind(favoriteController));

export default router;
