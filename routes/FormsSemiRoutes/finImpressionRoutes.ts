import express from 'express';
const router = express.Router();
import * as controller from '../../controllers/FormulairesSemi/finImpressionController';
// Ajouter une nouvelle fin d'impression
router.post('/', controller.dbInsertFinImpression);

// Obtenir tous les lots
router.get('/lots', controller.getAllLots);

// Obtenir les détails d’un lot
router.get('/lot/:id', controller.getLotDetails);

export default router;
