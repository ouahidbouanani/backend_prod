import express from 'express'
const router = express.Router()
import * as impressionController from '../../controllers/FormulairesSemi/impressionController'

// Routes
router.post('/ajouter', impressionController.addImpression)
router.get('/', impressionController.getImpressions) 

export default router;
