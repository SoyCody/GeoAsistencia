import { Router } from 'express';
import { auth, isAdmin } from '../middlewares/auth.middleware.js';
import { 
    createGeocerca, 
    updateGeocerca, 
    deleteGeocerca, 
    listGeocercas, 
    listGeocercaById,
    listUsersByGeocerca
} from '../modules/geocerca/geocerca.controller.js';

const  router = Router();

router.post('/create', auth, isAdmin, createGeocerca);
router.put('/update/:id', auth, isAdmin, updateGeocerca);
router.delete('/delete/:id', auth, isAdmin, deleteGeocerca);
router.get('/list/:id', auth, isAdmin, listGeocercas);
router.get('/watch/:id', auth, isAdmin, listGeocercaById);
router.get('/users/:id', auth, isAdmin, listUsersByGeocerca);

export default router;