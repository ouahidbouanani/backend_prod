import { Router } from "express";
import {
  createFinAssemblage,
  getFinAssemblageById,
  getFinAssemblageIds,
} from "../../controllers/FormulairesFinis/FinAssemblageController";

const router = Router();

/**
 * @openapi
 * /api/finassemblage:
 *   post:
 *     tags: [Assemblage]
 *     summary: Créer une fin assemblage
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       201:
 *         description: Créé
 */

router.post("/", createFinAssemblage);

/**
 * @openapi
 * /api/finassemblage/ids:
 *   get:
 *     tags: [Assemblage]
 *     summary: Liste des IDs fin assemblage
 *     responses:
 *       200:
 *         description: Tableau d'IDs
 */
router.get("/ids", getFinAssemblageIds);

/**
 * @openapi
 * /api/finassemblage/{id}:
 *   get:
 *     tags: [Assemblage]
 *     summary: Détails fin assemblage
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
router.get("/:id", getFinAssemblageById);

export default router;
