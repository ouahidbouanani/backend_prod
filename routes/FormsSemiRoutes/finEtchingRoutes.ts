import express from 'express';
const router = express.Router();
import * as finEtchingController from '../../controllers/FormulairesSemi/finEtchingController';

// Obtenir tous les lots disponibles depuis la table debut_etching
router.get('/lots', finEtchingController.getLots);

// Obtenir les données (wafer + dernier passage) pour un lot donné
router.get('/lot-info/:lotId', finEtchingController.getLotInfo);

// Ajouter un enregistrement de fin etching
router.post('/add', finEtchingController.addFinEtching);

export default router;
