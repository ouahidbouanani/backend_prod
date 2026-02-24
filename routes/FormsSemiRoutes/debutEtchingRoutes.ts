// routes/debutEtchingRoutes.js
import express from'express'
const router = express.Router();
import * as controller from '../../controllers/FormulairesSemi/debutEtchingController'

// Options (activité -> types de pièces)
router.get('/options/activities', controller.getActivities)
router.get('/options/type-pieces', controller.getTypePiecesOptions)

// Récupérer les lots depuis la table fin_impression
router.get('/lots', controller.getLots)

// Ajouter un nouvel enregistrement dans debut_etching
router.post('/add', controller.addDebutEtching)

// Route pour obtenir toutes les données de la table debut_etching pour l'affihcher dans le tableau
router.get('/all', controller.getAllDebutEtching)

router.get('/count/:lotId', controller.getNbPassages)

export default router
