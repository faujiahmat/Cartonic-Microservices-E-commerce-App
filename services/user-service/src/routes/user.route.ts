import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/profile', UserController.getUserProfile);
router.patch('/profile', UserController.updateUserProfile);
router.delete('/profile', UserController.deleteUserProfile);
router.get('/:id/refresh-token', UserController.refreshAccessToken);
router.get('/:id/logout', UserController.logout);

export default router;
