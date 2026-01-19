import { Router } from 'express';
import { getAuditorias } from '../modules/auditoria/auditoria.controller.js';
import { auth, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', auth, isAdmin, getAuditorias);

export default router;
