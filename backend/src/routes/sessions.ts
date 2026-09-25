import { Router } from 'express';
import { getSessions, createSession, endSession } from '../controllers/session.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getSessions);
router.post('/create', createSession);
router.post('/:id/end', endSession);

export default router;
