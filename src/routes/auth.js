import { Router } from 'express';
import { registerUser, login, logout, createUser } from '../modules/auth/auth.controller.js';
import { mobileLogin, validateToken, changePassword } from '../modules/auth/auth.controller.mobile.js';
import { auth, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Web routes (existing)
router.post('/register', auth, isAdmin, registerUser);
router.post('/login', login);
router.post('/logout', auth, logout);
router.post('/create-user', auth, isAdmin, createUser);

// Mobile routes (new)
router.post('/mobile/login', mobileLogin);
router.get('/me', auth, validateToken);
router.put('/change-password', auth, changePassword);

export default router;