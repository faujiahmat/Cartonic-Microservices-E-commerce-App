import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';

const router = Router();

router.post('/', CategoryController.createCategory);
router.get('/all', CategoryController.getCategories);
router.get('/:category_id', CategoryController.getCategoryById);
router.patch('/:category_id', CategoryController.updateCategory);
router.delete('/:category_id', CategoryController.deleteCategory);

export default router;
