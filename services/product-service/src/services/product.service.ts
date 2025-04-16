import mongoose from 'mongoose';
import Product, { IProduct } from '../models/product.model';

export class ProductService {
  // Membuat produk baru
  static async createProduct(payload: IProduct) {
    return (await Product.create(payload)).populate('category');
  }

  // Mendapatkan semua produk
  static async getAllProducts() {
    return await Product.find({}).populate('category');
  }

  // Mendapatkan produk berdasarkan ID
  static async getProductById(product_id: string) {
    return await Product.findOne({ product_id }).populate('category');
  }

  // Memperbarui produk berdasarkan ID
  static async updateProduct(product_id: string, payload: Partial<IProduct>) {
    return await Product.findOneAndUpdate({ product_id }, payload, {
      new: true,
    }).populate('category');
  }

  static async updateProductStock(product_id: string, quantity: number) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Ambil data produk dengan hanya `stock` agar lebih efisien
      const product = await Product.findOne({ product_id }).select('stock').session(session);

      if (!product) throw new Error('Product not found');
      if (product.stock < quantity) throw new Error('Insufficient stock');

      // Update stok langsung menggunakan `updateOne`
      await Product.updateOne({ product_id }, { $inc: { stock: -quantity } }, { session });

      await session.commitTransaction();
      session.endSession();

      return { product_id, newStock: product.stock - quantity };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // Menghapus produk berdasarkan ID
  static async deleteProduct(product_id: string) {
    return await Product.findOneAndDelete({ product_id }).populate('category');
  }

  static async filterProducts(filter: any, sortOptions: any, skip: number, limit: number) {
    return await Product.find(filter)
      .populate('category')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
  }

  static async countDocuments(filter: any) {
    return await Product.countDocuments(filter);
  }
}
