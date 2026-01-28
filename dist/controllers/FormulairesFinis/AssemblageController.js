"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableLotsForReference = void 0;
// ============================================
// controllers/FormulairesFinis/AssemblageController.js
// ============================================
const prisma_1 = __importDefault(require("../../config/prisma"));
const getAvailableLotsForReference = async (req, res) => {
    try {
        const reference = req.query.reference;
        if (!reference || typeof reference !== 'string') {
            res.status(400).json({ error: 'Paramètre "reference" obligatoire' });
            return;
        }
        const lots = await prisma_1.default.lot_status.findMany({
            where: {
                type_piece: reference, // ex: "N100"
                current_step: 'pret_assemblage',
                disponible_finis: true,
            },
            select: {
                id_lot: true
            },
        });
        res.json(lots);
    }
    catch (err) {
        console.error('Erreur lors de la récupération des lots disponibles :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getAvailableLotsForReference = getAvailableLotsForReference;
