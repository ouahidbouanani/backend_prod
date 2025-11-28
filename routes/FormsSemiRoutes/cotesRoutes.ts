import express from 'express';
const router = express.Router();
import * as cotesController from '../../controllers/FormulairesSemi/cotesController';

router.get('/lot/:id_lot/:nb_passage', cotesController.getCotesByLotId);

export default router;
