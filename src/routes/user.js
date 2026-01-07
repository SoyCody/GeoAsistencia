import { Router } from 'express';
import  { 
    getMe, 
    listActives, 
    listSuspended, 
    listDeleted, 
    assignAdmin, 
    revokeAdmin, 
    deleteUser, 
    suspendUser,
    actives,
    suspended,
    deleted,
    countTotal
} from '../modules/users/user.controller.js';
import { auth, isAdmin } from '../middlewares/auth.middleware.js';

const router= Router();

// Rutas administradores
router.put('/admin/:id', auth, isAdmin, assignAdmin);
router.put('/revoke/:id', auth, isAdmin, revokeAdmin)

// Rutas para usuarios
router.get('/me', auth, getMe);

// Rutas para administradores
router.get('/list/active', auth, isAdmin, listActives);
router.get('/list/suspended', auth, isAdmin, listSuspended);
router.get('/list/deleted', auth, isAdmin, listDeleted);
router.put('/delete/:id', auth, isAdmin, deleteUser);
router.put('/suspend/:id', auth, isAdmin, suspendUser);

router.get('/actives', auth, isAdmin, actives);
router.get('/suspended', auth, isAdmin, suspended);
router.get('/deleted', auth, isAdmin, deleted);
router.get('/total', auth, isAdmin, countTotal);

export default router;