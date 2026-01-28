"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DebutTomoController_1 = require("../../controllers/FormulairesFinis/DebutTomoController");
const router = express_1.default.Router();
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
router.post("/", DebutTomoController_1.createDebutTomoFinis);
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
router.get("/:id", DebutTomoController_1.getDebutTomoFinisById);
exports.default = router;
