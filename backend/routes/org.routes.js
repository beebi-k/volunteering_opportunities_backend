import express from 'express';
import * as orgController from '../controllers/org.controller.js';

const router = express.Router();

router.get('/', orgController.getAllOrgs);
router.get('/:id', orgController.getOrgById);

export default router;
