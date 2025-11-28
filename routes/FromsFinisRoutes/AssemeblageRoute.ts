import express from 'express';
const router = express.Router();
import * as controller from '../../controllers/FormulairesFinis/AssemblageController';
import e from 'express';

// Ajouter un nouvel enregistrement
router.post('/add', controller.addAssemblage);

export default router;