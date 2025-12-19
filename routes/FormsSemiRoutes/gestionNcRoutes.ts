import express from 'express';
const router = express.Router();
import * as controller from '../../controllers/FormulairesSemi/gestionNcController';


// Récuperer tous les lots 
router.get('/nc/lots', controller.getLotsForNc);
// POST - Déclarer une nouvelle NC
router.post('/nc/add', controller.declarerNc);
router.post('/nc/adds', controller.storeNcPieces);

// GET - Obtenir toutes les NC
router.get('/nc', controller.getAllNc);

// GET - NC non traitées
router.get('/nc/non-traitees', controller.getNcNonTraitees);

// GET - Détails d’une NC
router.get('/nc/:id', controller.getNcById);

// PUT - Mise à jour d’une NC (traitement par admin)
router.put('/nc/:id', controller.updateNc);

export default router;
