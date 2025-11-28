import express from 'express';
const router = express.Router();
import * as suiviController from '../../controllers/FormulairesSemi/suiviController';

router.get("/lots", suiviController.getLotsProgress);

export default router;
