// src/routes/produitsFinisRoutes.ts
import { Router } from 'express';
import {
  getProduitsFinis,
  createProduitFini,
  deleteProduitFini,
} from '../../controllers/admin/produitsFinisController';

const router = Router();

// GET /api/produits-finis
router.get('/', getProduitsFinis);

// POST /api/produits-finis
router.post('/', createProduitFini);

// DELETE /api/produits-finis/:id
router.delete('/:id', deleteProduitFini);

export default router;
