"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLots = exports.getAll = exports.create = void 0;
// ============================================
// controllers/FormulairesFinis/FinTomoController.js
// ============================================
const prisma_1 = __importDefault(require("../../config/prisma"));
const create = async (req, res) => {
    try {
        const { id, quantite, date, heure, operateur } = req.body;
        await prisma_1.default.fintomo_finis.create({
            data: {
                id, quantite,
                date: new Date(date),
                heure: new Date(`1970-01-01T${heure}`),
                operateur
            }
        });
        res.status(201).json({ message: 'Fin de tomographie enregistrée et statut mis à jour' });
    }
    catch (err) {
        console.error('Erreur insertion fin_tomo :', err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'insertion fin_tomo' });
    }
};
exports.create = create;
const getAll = async (req, res) => {
    try {
        const results = await prisma_1.default.fintomo_finis.findMany();
        res.json(results);
    }
    catch (err) {
        console.error('Erreur récupération :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getAll = getAll;
const getLots = async (req, res) => {
    try {
        const results = await prisma_1.default.debuttomo_finis.findMany({
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
