// src/routes/semiFinisAchetesRoutes.ts
import { Router } from 'express';
import {
  getSemiFinisAchetes,
  createSemiFiniAchete,
  deleteSemiFiniAchete,
} from '../../controllers/admin/semiFinisAchetesController';

const router = Router();

// GET /api/semi-finis-achetes
router.get('/', getSemiFinisAchetes);

// POST /api/semi-finis-achetes
router.post('/', createSemiFiniAchete);

// DELETE /api/semi-finis-achetes/:id
router.delete('/:id', deleteSemiFiniAchete);

export default router;
