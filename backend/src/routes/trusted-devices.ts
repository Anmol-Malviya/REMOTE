import { Router } from 'express';
import { getTrustedDevices, revokeTrustedDevice } from '../controllers/trusted-device.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getTrustedDevices);
router.delete('/:id', revokeTrustedDevice);

export default router;
