import express from 'express';
const router = express.Router();
import * as versionPieceController from '../controllers/versionPieceController';

// Récupérer toutes les versions
router.get('/', versionPieceController.getAllVersions);

// Ajouter une nouvelle version
router.post('/', versionPieceController.createVersion);

// Supprimer une version
router.delete('/:version', versionPieceController.deleteVersion);

router.get('/revision', versionPieceController.getLatestVersionByPiece);



export default router;
