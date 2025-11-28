
import express from 'express'
const router = express.Router()
import * as piecesController from '../../controllers/FormulairesSemi/priseCotesController'

router.get('/lots', piecesController.getLots)
router.post('/pieces/submit', piecesController.submitPieces)
router.post('/pieces/ajouter', piecesController.ajouterPriseCotes)
router.get('/lots/piece/:id_lot', piecesController.GetTypePiece)
router.get('/mesures/:id_lot/:nb_passage', piecesController.getMesuresByLotAndPassage)

export default router;
