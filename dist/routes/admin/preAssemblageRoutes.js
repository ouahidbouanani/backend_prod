"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const preAssemblageController_1 = require("../../controllers/admin/preAssemblageController");
const router = (0, express_1.Router)();
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
router.get("/", preAssemblageController_1.getAllPreAssemblages);
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
router.post("/", preAssemblageController_1.createPreAssemblage);
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
router.delete("/:id", preAssemblageController_1.deletePreAssemblage);
exports.default = router;
