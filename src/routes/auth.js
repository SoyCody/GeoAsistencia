import { Router } from 'express';
import { registerUser } from '../modules/usuarios/user.controller.js';

const router= Router();

router.post('/register', registerUser);

export default router;