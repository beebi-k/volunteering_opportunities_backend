import express from 'express';
import * as oppController from '../controllers/opp.controller.js';

const router = express.Router();

router.get('/', oppController.getAllOpps);
router.get('/:id', oppController.getOppById);

export default router;
