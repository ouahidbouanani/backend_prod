import express from 'express';
const router = express.Router();
import * as debutTomoController from '../../controllers/FormulairesSemi/debutTomoController';

// Enregistrer un début de tomographie
router.post('/', debutTomoController.create);

// Récupérer tous les débuts tomographie (optionnel)
router.get('/', debutTomoController.getAll);

// Obtenir tous les lots disponibles depuis la table debut_etching
router.get('/lots', debutTomoController.getLots);

export default router;
