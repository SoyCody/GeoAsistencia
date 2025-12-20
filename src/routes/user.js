import { Router } from 'express';
import  { 
    getMe, 
    listActives, 
    listSuspended, 
    listDeleted, 
    assignAdmin, 
    revokeAdmin 
} from '../modules/users/user.controller.js';
import { auth, isAdmin } from '../middlewares/auth.middleware.js';

const router= Router();

// Rutas administradores
router.put('/admin/:id', assignAdmin);
router.put('/revoke/:id', revokeAdmin)

// Rutas para usuarios
router.get('/me', auth, getMe);

// Rutas para administradores
router.get('/list/active', auth, isAdmin, listActives);
router.get('/list/suspended', auth, isAdmin, listSuspended);
router.get('/list/deleted', auth, isAdmin, listDeleted);

export default router;