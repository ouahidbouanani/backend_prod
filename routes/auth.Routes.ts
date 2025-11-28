import express from 'express';
const router = express.Router();
import * as authController from '../controllers/auth-controller';

//register
router.post('/register', authController.register);
router.get('/verify-email', authController.verifyEmail);

//login
router.post('/login', authController.login);
router.get('/protected', authController.protectedRoute);

export default router;
