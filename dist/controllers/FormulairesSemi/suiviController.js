"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLotsProgress = void 0;
// ============================================
// controllers/FormulairesSemi/suiviController.js
// ============================================
const prisma_1 = __importDefault(require("../../config/prisma"));
const getLotsProgress = async (req, res) => {
    try {
        const results = await prisma_1.default.lot_status.findMany({
            select: {
                id_lot: true,
                activity: true,
                nb_pieces: true,
                current_step: true,
                type_piece: true,
                revision: true
            }
        });
        res.json(results);
    }
    catch (error) {
        console.error("Erreur lors de la récupération des lots :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.getLotsProgress = getLotsProgress;
