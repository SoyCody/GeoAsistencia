import Router from 'express';
import { entrada, salida, asistencias, atrasos }from '../modules/registro/registro.controller.js';
import { auth, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/entrada', auth, entrada);
router.post('/salida', auth, salida);
router.get('/total', auth, isAdmin, asistencias);
router.get('/atrasos', auth, isAdmin, atrasos)

export default router;