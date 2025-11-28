"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAssemblage = void 0;
// ============================================
// controllers/FormulairesFinis/AssemblageController.js
// ============================================
const prisma_1 = __importDefault(require("../../config/prisma"));
const addAssemblage = async (req, res) => {
    try {
        const { activity, quantite, id_nozzle, id_body, date, operateur, commentaire } = req.body;
        const result = await prisma_1.default.assemblage.create({
            data: {
                activity,
                quantite,
                id_nozzle,
                id_body,
                date: new Date(date),
                operateur,
                commentaire
            }
        });
        res.status(200).json(result);
    }
    catch (err) {
        console.error('❌ Erreur lors de l\'insertion:', err);
        res.status(500).json({ success: false, message: 'Erreur dans la base de données' });
    }
};
exports.addAssemblage = addAssemblage;
