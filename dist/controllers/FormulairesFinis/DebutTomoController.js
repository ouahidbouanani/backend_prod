"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLots = exports.create = void 0;
// ============================================
// controllers/FormulairesFinis/DebutTomoController.js
// ============================================
const prisma_1 = __importDefault(require("../../config/prisma"));
const create = async (req, res) => {
    try {
        const { id, nb_pieces, etage, date, heure_debut, operateur, num_machine, version, separation, commentaire } = req.body;
        await prisma_1.default.debuttomo_finis.create({
            data: {
                id, nb_pieces, etage,
                date: new Date(date),
                heure_debut: new Date(`1970-01-01T${heure_debut}`),
                operateur, num_machine, version, separation, commentaire
            }
        });
        res.status(201).json({ message: 'Début de tomographie enregistré et statut mis à jour' });
    }
    catch (err) {
        console.error('Erreur d\'insertion :', err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement' });
    }
};
exports.create = create;
const getLots = async (req, res) => {
    try {
        const results = await prisma_1.default.assemblage.findMany({
            select: { id: true }
        });
        res.json(results);
    }
    catch (err) {
        console.error('Erreur lors de la récupération des lots:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getLots = getLots;
