import express from 'express';
const router = express.Router();
import * as pieceController from '../controllers/pieceController';

//ajouter une pièce
router.post("/pieces", pieceController.ajouterPiece);

//récuperer tous les pièces
router.get('/pieces', pieceController.getAllPieces);

//récuperer tous les nom des pieces disponible
router.get('/pieces_nom', pieceController.getAllPiecesName);

// récuperer les données d'une pièce a partir de son id
router.get('/pieces/:id', pieceController.getPieceById);

//modifier une pièce
router.put('/pieces/:id', pieceController.updatePiece);

//supprimer une pièce
router.delete('/pieces/:id', pieceController.deletePiece);

// Route pour récupérer les types de pièces
router.get('/types', pieceController.getTypePieces)

export default router;