import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

const router = Router();

router.post('/', OrderController.createOrder);
router.get('/:orderId', OrderController.getOrder);
router.patch('/:orderId/status', OrderController.updateOrderStatus);
router.delete('/:orderId', OrderController.deleteOrder);

export default router;
