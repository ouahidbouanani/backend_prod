import express from "express";
import { createDebutTomoFinis, getDebutTomoFinisById } from "../../controllers/FormulairesFinis/DebutTomoController";

const router = express.Router();

/**
 * @openapi
 * /api/debut-tomo-finis:
 *   post:
 *     tags: [Tomo]
 *     summary: Créer un début tomographie (finis)
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

router.post("/", createDebutTomoFinis);

/**
 * @openapi
 * /api/debut-tomo-finis/{id}:
 *   get:
 *     tags: [Tomo]
 *     summary: Détails début tomographie (finis)
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
router.get("/:id", getDebutTomoFinisById);

export default router;