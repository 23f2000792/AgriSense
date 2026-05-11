import express from 'express';
import { login } from '../controllers/auth.controller.js';
import { getVisits, syncOutcomes, addVisit } from '../controllers/visit.controller.js';
import { initDb } from '../controllers/init.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public Routes
router.post('/login', login);
router.get('/init', initDb);

// Protected Routes
router.get('/visits', protect, getVisits);
router.post('/visits', protect, addVisit);
router.post('/sync-outcomes', protect, syncOutcomes);

export default router;
