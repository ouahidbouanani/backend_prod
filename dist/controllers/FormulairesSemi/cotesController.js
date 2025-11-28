"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCotesByLotId = void 0;
// ============================================
// controllers/FormulairesSemi/cotesController.js
// ============================================
const prisma_1 = __importDefault(require("../../config/prisma"));
const getCotesByLotId = async (req, res) => {
    try {
        const { id_lot, nb_passage } = req.params;
        const results = await prisma_1.default.mesure_cote_piece.findMany({
            where: {
                id_lot: parseInt(id_lot),
                nb_passage: parseInt(nb_passage)
            },
            select: {
                id_piece_locale: true,
                id_lot: true,
                id_cote_piece: true,
                valeur: true
            }
        });
        res.json(results);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des cotes :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getCotesByLotId = getCotesByLotId;
