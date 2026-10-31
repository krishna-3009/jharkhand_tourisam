import { Router } from 'express';
import { addTrip, clearTrips, deleteTrip, listTrips, updateTrip } from '../controllers/trip.controller.js';
import { requireAuth } from '../middleware/require-auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', listTrips);
router.post('/', addTrip);
router.put('/:id', updateTrip);
router.delete('/', clearTrips);
router.delete('/:id', deleteTrip);

export default router;
