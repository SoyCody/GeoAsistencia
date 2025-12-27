import { Router } from 'express';
import { auth, isAdmin } from '../middlewares/auth.middleware.js';
import { createSede, listSedes, getSedeById, updateSede, deleteSede } from '../modules/sede/sede.controller.js';


const router = Router();

router.post('/create', auth, isAdmin, createSede);
router.get('/list', auth, isAdmin, listSedes);
router.get('/list/:id', auth, isAdmin, getSedeById);
router.put('/update/:id', auth, isAdmin, updateSede);
router.delete('/delete/:id', auth, isAdmin, deleteSede);

export default router;