import {Router} from 'express';
import  { getMe, listUsers } from '../modules/users/user.controller.js';
import {auth} from '../middlewares/auth.middleware.js';

const router= Router();

// Rutas para usuarios
router.get('/me', auth, getMe);
router.get('/list', auth, listUsers);

// Rutas para administradores

export default router;