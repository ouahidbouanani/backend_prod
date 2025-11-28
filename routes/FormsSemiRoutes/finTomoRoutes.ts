import express from 'express';
const router = express.Router();
import * as finTomoController from '../../controllers/FormulairesSemi/finTomoController';

router.post('/add', finTomoController.create)
router.get('/all', finTomoController.getAll)

// Obtenir tous les lots disponibles depuis la table debut_Tomo
router.get('/lots', finTomoController.getLots);

export default router;