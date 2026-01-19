import Router from 'express';
import { assignWorker, changeAssign, listUsuariosGeocerca, listUsuariosDisponibles, removeAssignment } from '../modules/asignacion/asignacion.controller.js';
import { auth, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/new', auth, isAdmin, assignWorker);
router.put('/change', auth, isAdmin, changeAssign);
router.get('/geocerca/:geocercaId/usuarios', auth, isAdmin, listUsuariosGeocerca);
router.get('/geocerca/:geocercaId/disponibles', auth, isAdmin, listUsuariosDisponibles);
router.delete('/remove/:perfilId/:geocercaId', auth, isAdmin, removeAssignment);

export default router;