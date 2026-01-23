import Router from 'express';
import {
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
    countTotal,
    watch,
    updateUser
} from '../modules/users/user.controller.js';
import { getMyProfile } from '../modules/user/user.controller.mobile.js';
import { auth, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas administradores
router.put('/admin/:id', auth, isAdmin, assignAdmin);
router.put('/revoke/:id', auth, isAdmin, revokeAdmin)

// Rutas para usuarios (ambos)
router.get('/me', auth, getMe);
router.get('/profile', auth, getMyProfile); // Nuevo endpoint móvil con estadísticas

// Rutas para administradores
router.get('/list/active', auth, isAdmin, listActives);
router.get('/list/suspended', auth, isAdmin, listSuspended);
router.get('/list/deleted', auth, isAdmin, listDeleted);
router.get('/watch/:id', auth, isAdmin, watch);
router.put('/delete/:id', auth, isAdmin, deleteUser);
router.put('/update/:id', auth, isAdmin, updateUser)
router.put('/suspend/:id', auth, isAdmin, suspendUser);

router.get('/actives', auth, isAdmin, actives);
router.get('/suspended', auth, isAdmin, suspended);
router.get('/deleted', auth, isAdmin, deleted);
router.get('/total', auth, isAdmin, countTotal);

export default router;