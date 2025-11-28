import express from 'express';
const router = express.Router();
import * as debutTomoController from '../../controllers/FormulairesFinis/DebutTomoController';


// Enregistrer un début de tomographie
router.post('/', debutTomoController.create);

router.get('/lots', debutTomoController.getLots);

export default router;