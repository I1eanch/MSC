import { Request, Response } from 'express';
import { tagService } from '../services/tag.service';

export class TagController {
  async getAllTags(req: Request, res: Response): Promise<void> {
    try {
      const tags = tagService.getAllTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tags' });
    }
  }

  async getTagById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tag = tagService.getTagById(id);

      if (!tag) {
        res.status(404).json({ error: 'Tag not found' });
        return;
      }

      res.json(tag);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tag' });
    }
  }

  async createTag(req: Request, res: Response): Promise<void> {
    try {
      const tag = req.body;
      const created = tagService.createTag(tag);
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create tag' });
    }
  }
}

export const tagController = new TagController();
