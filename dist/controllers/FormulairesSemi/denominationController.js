"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDenomination = exports.getAllDenominations = void 0;
// ============================================
// controllers/FormulairesSemi/denominationController.js
// ============================================
const prisma_1 = __importDefault(require("../../config/prisma"));
const getAllDenominations = async (req, res) => {
    try {
        const results = await prisma_1.default.denomination_options.findMany({
            select: { name: true }
        });
        res.json(results);
    }
    catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};
exports.getAllDenominations = getAllDenominations;
const createDenomination = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name)
            return res.status(400).json({ message: 'Nom requis' });
        const result = await prisma_1.default.denomination_options.create({
            data: { name }
        });
        res.status(201).json({ id: result.id, name });
    }
    catch (err) {
        res.status(500).json({ message: 'Erreur lors de l\'insertion', error: err.message });
    }
};
exports.createDenomination = createDenomination;
