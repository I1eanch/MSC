import { Category } from '../types/article.types';
import { articleStore } from '../models/article.model';

export class CategoryService {
  getAllCategories(): Category[] {
    return articleStore.getAllCategories();
  }

  getCategoryById(id: string): Category | undefined {
    return articleStore.getCategoryById(id);
  }

  createCategory(category: Category): Category {
    return articleStore.createCategory(category);
  }
}

export const categoryService = new CategoryService();
