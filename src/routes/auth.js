import { Router } from 'express';
import { registerUser, login, logout } from '../modules/auth/auth.controller.js';
import { auth, isAdmin } from '../middlewares/auth.middleware.js';

const router= Router();

router.post('/register', auth, isAdmin, registerUser);
router.post('/login', login);
router.post('/logout', auth, logout);


export default router;