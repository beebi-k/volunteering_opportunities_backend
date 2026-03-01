import express from 'express';
import * as appController from '../controllers/app.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, appController.apply);
router.get('/my-applications', authMiddleware, appController.getMyApplications);

export default router;
