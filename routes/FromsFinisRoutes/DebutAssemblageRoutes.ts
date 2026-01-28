import express from "express";
import * as controller from "../../controllers/FormulairesFinis/DebutAssemblageController";

const router = express.Router();

/**
 * @openapi
 * /api/debutassemblage:
 *   post:
 *     tags: [Assemblage]
 *     summary: Créer un début assemblage
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

router.post("/", controller.createDebutAssemblage);

/**
 * @openapi
 * /api/debutassemblage/lots-disponibles:
 *   get:
 *     tags: [Assemblage]
 *     summary: Lots disponibles pour assemblage
 *     responses:
 *       200:
 *         description: Liste
 */
router.get('/lots-disponibles', controller.getAvailableLotsForReference);

/**
 * @openapi
 * /api/debutassemblage/ids:
 *   get:
 *     tags: [Assemblage]
 *     summary: Liste des IDs début assemblage
 *     responses:
 *       200:
 *         description: Tableau d'IDs
 */
router.get("/ids", controller.listDebutAssemblageIds);

/**
 * @openapi
 * /api/debutassemblage/{id}:
 *   get:
 *     tags: [Assemblage]
 *     summary: Détails d'un début assemblage
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
router.get("/:id", controller.getDebutAssemblageById);

export default router;
