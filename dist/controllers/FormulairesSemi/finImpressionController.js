"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLotDetails = exports.getAllLots = exports.dbInsertFinImpression = void 0;
// ============================================
// controllers/FormulairesSemi/finImpressionController.js
// ============================================
const prisma_1 = __importDefault(require("../../config/prisma"));
const dbInsertFinImpression = async (req, res) => {
    try {
        const { id_lot, num_lot_wafer, nb_lancees, nb_imprimees, operateur, date_fin, commentaires } = req.body;
        await prisma_1.default.$transaction(async (tx) => {
            await tx.fin_impression.create({
                data: {
                    id_lot, num_lot_wafer, nb_lancees, nb_imprimees,
                    operateur, date_fin: new Date(date_fin), commentaires
                }
            });
            await tx.lot_status.upsert({
                where: { id_lot: id_lot },
                update: { current_step: 'fin_impression' },
                create: { id_lot: id_lot, current_step: 'fin_impression', type_piece: '', revision: '' }
            });
        });
        res.status(200).json({ success: true, message: 'Toutes les données enregistrées avec succès' });
    }
    catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.dbInsertFinImpression = dbInsertFinImpression;
const getAllLots = async (req, res) => {
    try {
        // Récupère tous les id_lot de fin_impression
        const finis = await prisma_1.default.fin_impression.findMany({
            select: { id_lot: true }
        });
        // Liste des ids déjà utilisés
        const idsUtilises = finis.map(item => item.id_lot);
        // Récupère tous les lots qui ne sont PAS dans fin_impression
        const results = await prisma_1.default.nouvelle_impression.findMany({
            where: {
                id: { notIn: idsUtilises }
            },
            select: { id: true }
        });
        res.json(results);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getAllLots = getAllLots;
const getLotDetails = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await prisma_1.default.nouvelle_impression.findUnique({
            where: { id },
            select: { nb_pieces: true, num_lot_wafer: true, type_pieces: true }
        });
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getLotDetails = getLotDetails;
