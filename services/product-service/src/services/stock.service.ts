import Product from '../models/product.model';

export class StockService {
  static async updateStock(product_id: string, stock: number) {
    return await Product.findOneAndUpdate({ product_id }, { stock }, { new: true });
  }

  static async getStock(product_id: string) {
    return await Product.findOne({ product_id }, 'stock').populate('category');
  }
}
