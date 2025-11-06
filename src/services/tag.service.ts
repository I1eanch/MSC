import { Tag } from '../types/article.types';
import { articleStore } from '../models/article.model';

export class TagService {
  getAllTags(): Tag[] {
    return articleStore.getAllTags();
  }

  getTagById(id: string): Tag | undefined {
    return articleStore.getTagById(id);
  }

  createTag(tag: Tag): Tag {
    return articleStore.createTag(tag);
  }
}

export const tagService = new TagService();
