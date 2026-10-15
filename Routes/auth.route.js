import express from 'express';
import authController from '../Controllers/auth.controller.js';
import checkToken from '../Middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', checkToken, authController.me);

export default router;
