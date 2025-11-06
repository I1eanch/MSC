import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';

export class CategoryController {
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = categoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = categoryService.getCategoryById(id);

      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      res.json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = req.body;
      const created = categoryService.createCategory(category);
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
}

export const categoryController = new CategoryController();
