"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FinTomoController_1 = require("../../controllers/FormulairesFinis/FinTomoController");
const router = express_1.default.Router();
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
router.get('/lots', FinTomoController_1.getLotsFinTomoFinis);
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
router.get('/:id', FinTomoController_1.getFinTomoFinisById);
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
router.post('/', FinTomoController_1.createFinTomoFinis);
exports.default = router;
