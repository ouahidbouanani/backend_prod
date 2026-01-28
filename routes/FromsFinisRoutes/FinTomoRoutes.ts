import express from 'express';
import { createFinTomoFinis, getFinTomoFinisById, getLotsFinTomoFinis } from '../../controllers/FormulairesFinis/FinTomoController';

const router = express.Router();

/**
 * @openapi
 * /api/fin-tomo-finis/lots:
 *   get:
 *     tags: [Tomo]
 *     summary: Lister les lots disponibles (fin tomo finis)
 *     responses:
 *       200:
 *         description: Liste
 */

router.get('/lots', getLotsFinTomoFinis);

/**
 * @openapi
 * /api/fin-tomo-finis/{id}:
 *   get:
 *     tags: [Tomo]
 *     summary: Détails fin tomo (finis)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails
 */
router.get('/:id', getFinTomoFinisById);

/**
 * @openapi
 * /api/fin-tomo-finis:
 *   post:
 *     tags: [Tomo]
 *     summary: Créer une fin tomo (finis)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Créé
 */
router.post('/', createFinTomoFinis);

export default router;