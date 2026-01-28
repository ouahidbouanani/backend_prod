"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FinAssemblageController_1 = require("../../controllers/FormulairesFinis/FinAssemblageController");
const router = (0, express_1.Router)();
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
router.post("/", FinAssemblageController_1.createFinAssemblage);
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
router.get("/ids", FinAssemblageController_1.getFinAssemblageIds);
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
router.get("/:id", FinAssemblageController_1.getFinAssemblageById);
exports.default = router;
