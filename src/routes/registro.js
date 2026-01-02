import Router from 'express';
import { entrada, salida }from '../modules/registro/registro.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/entrada', auth, entrada);
router.post('/salida', auth, salida);

export default router;