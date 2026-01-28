import { Router } from "express";
import {
  getAllPreAssemblages,
  createPreAssemblage,
  deletePreAssemblage,
} from "../../controllers/admin/preAssemblageController";

const router = Router();

// GET /api/semi-finis-pre-assemblage

/**
 * @openapi
 * /api/semi-finis-pre-assemblage:
 *   get:
 *     tags: [Admin]
 *     summary: Lister les semi-finis pré-assemblage
 *     responses:
 *       200:
 *         description: Liste
 */
router.get("/", getAllPreAssemblages);

// POST /api/semi-finis-pre-assemblage

/**
 * @openapi
 * /api/semi-finis-pre-assemblage:
 *   post:
 *     tags: [Admin]
 *     summary: Créer un semi-fini pré-assemblage
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
router.post("/", createPreAssemblage);

// DELETE /api/semi-finis-pre-assemblage/:id

/**
 * @openapi
 * /api/semi-finis-pre-assemblage/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Supprimer un semi-fini pré-assemblage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Supprimé
 */
router.delete("/:id", deletePreAssemblage);

export default router;
