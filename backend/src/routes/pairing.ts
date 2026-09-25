import { Router } from 'express';
import { createSession, joinSession, approveSession, rejectSession } from '../controllers/pairing.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/create', createSession);
router.post('/join', joinSession);
router.post('/approve', approveSession);
router.post('/reject', rejectSession);

export default router;
