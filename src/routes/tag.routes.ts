import { Router } from 'express';
import { tagController } from '../controllers/tag.controller';

const router = Router();

router.get('/', tagController.getAllTags.bind(tagController));
router.get('/:id', tagController.getTagById.bind(tagController));
router.post('/', tagController.createTag.bind(tagController));

export default router;
