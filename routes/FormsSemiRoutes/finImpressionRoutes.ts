import express from 'express';
const router = express.Router();
import * as controller from '../../controllers/FormulairesSemi/finImpressionController';
// Ajouter une nouvelle fin d'impression
router.post('/', controller.dbInsertFinImpression);

// Options (activité -> types de pièces)
router.get('/options/activities', controller.getActivities);
router.get('/options/type-pieces', controller.getTypePiecesOptions);

// Obtenir tous les lots
router.get('/lots', controller.getAllLots);

// Obtenir les détails d’un lot
router.get('/lot/:id', controller.getLotDetails);

export default router;
