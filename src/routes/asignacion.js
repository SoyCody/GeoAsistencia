import Router from 'express';
import { assignWorker, changeAssign } from '../modules/asignacion/asignacion.controller.js';
import { auth, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/new', auth, isAdmin, assignWorker);
router.put('/change', auth, isAdmin, changeAssign);

export default router;