import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { StockController } from '../controllers/stock.controller';
import { ReviewController } from '../controllers/review.controller';

const router = Router();

// Product
router.post('/', ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.get('/:productId', ProductController.getProductById);
router.patch('/:productId', ProductController.updateProduct);
router.delete('/:productId', ProductController.deleteProduct);

// Product Kategori
router.post('/:productId/categories', ProductController.addCategoryToProduct);
router.delete('/:productId/categories/:categoryId', ProductController.removeCategoryFromProduct);

// Stock
router.put('/:productId/stock', StockController.updateStock);
router.get('/:productId/stock', StockController.getStock);

// Review
router.post('/:productId/reviews', ReviewController.addReview);
router.get('/:productId/reviews', ReviewController.getReviews);
router.patch('/:productId/reviews/:reviewId', ReviewController.updateReview);
router.delete('/:productId/reviews/:reviewId', ReviewController.deleteReview);

export default router;
