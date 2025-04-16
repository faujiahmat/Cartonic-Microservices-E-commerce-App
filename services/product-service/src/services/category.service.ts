import Category, { ICategory } from '../models/category.model';

export class CategoryService {
  static async createCategory(payload: ICategory) {
    return await Category.create(payload);
  }

  static async getAllCategories() {
    return await Category.find({});
  }

  static async getCategoryById(category_id: string) {
    return await Category.findOne({ category_id });
  }

  static async getCategoryByName(name: string) {
    return await Category.findOne({ name });
  }

  static async updateCategory(category_id: string, payload: ICategory) {
    return await Category.findOneAndUpdate({ category_id }, payload, {
      new: true,
    });
  }

  static async deleteCategory(category_id: string) {
    return await Category.findOneAndDelete({ category_id });
  }
}
