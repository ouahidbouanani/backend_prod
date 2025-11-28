import express from 'express';
const router = express.Router();
import * as denominationController from '../../controllers/FormulairesSemi/denominationController';

router.get('/', denominationController.getAllDenominations);
router.post('/', denominationController.createDenomination);

export default router;
