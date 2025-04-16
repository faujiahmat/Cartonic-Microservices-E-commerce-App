import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();

router.post('/', PaymentController.createPayment);
router.get('/:id', PaymentController.getPayment);
router.patch('/:id', PaymentController.updatePaymentMethod);
router.post('/webhook', PaymentController.paymentWebhook);

export default router;
