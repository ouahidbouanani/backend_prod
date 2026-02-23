"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller = __importStar(require("../../controllers/FormulairesFinis/DebutAssemblageController"));
const router = express_1.default.Router();
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
 * /api/debutassemblage/preassemblage/{id}:
 *   get:
 *     tags: [Assemblage]
 *     summary: Pièces (QC ok) depuis fin pré-assemblage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pièces et quantité
 */
router.get("/preassemblage/:id", controller.getPreassemblagePiecesForDebutAssemblage);
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
exports.default = router;
