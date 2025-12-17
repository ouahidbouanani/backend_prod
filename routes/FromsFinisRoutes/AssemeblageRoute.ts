import express from 'express';
const router = express.Router();
import * as controller from '../../controllers/FormulairesFinis/AssemblageController';



router.get('/lots-disponibles', controller.getAvailableLotsForReference);

export default router;