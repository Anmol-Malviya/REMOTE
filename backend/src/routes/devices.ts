import { Router } from 'express';
import { getDevices, registerDevice, deleteDevice } from '../controllers/device.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getDevices);
router.post('/register', registerDevice);
router.delete('/:id', deleteDevice);

export default router;
