"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLotDetails = exports.getAllLots = exports.getTypePiecesOptions = exports.getActivities = exports.dbInsertFinImpression = void 0;
// ============================================
// controllers/FormulairesSemi/finImpressionController.js
// ============================================
const prisma_1 = __importDefault(require("../../config/prisma"));
const dbInsertFinImpression = async (req, res) => {
    try {
        const { id_lot, activity, type_pieces, num_lot_wafer, nb_lancees, nb_imprimees, operateur, date_fin, commentaires } = req.body;
        await prisma_1.default.$transaction(async (tx) => {
            await tx.fin_impression.create({
                data: {
                    id_lot,
                    num_lot_wafer,
                    nb_lancees,
                    nb_imprimees,
                    operateur, date_fin: new Date(date_fin), commentaires
                }
            });
            // Renseigner les nouvelles colonnes via SQL pour rester compatible
            // même si Prisma Client n'a pas encore été régénéré.
            if (activity || type_pieces) {
                await tx.$executeRaw `
        UPDATE fin_impression
        SET activity = ${activity ?? null},
          type_pieces = ${type_pieces ?? null}
        WHERE id_lot = ${id_lot}
        `;
            }
            await tx.lot_status.update({
                where: { id_lot: id_lot },
                data: { current_step: 'debut_etching' },
            });
        });
        res.status(200).json({ success: true, message: '✅ Données enregistrées avec succès.' });
    }
    catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.dbInsertFinImpression = dbInsertFinImpression;
const getActivities = async (req, res) => {
    try {
        const rows = await prisma_1.default.nouvelle_impression.findMany({
            where: {
                activity: { not: null }
            },
            distinct: ['activity'],
            select: { activity: true },
            orderBy: { activity: 'asc' }
        });
        res.json(rows.map(r => r.activity).filter((v) => Boolean(v)));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getActivities = getActivities;
const getTypePiecesOptions = async (req, res) => {
    try {
        const activity = typeof req.query.activity === 'string' ? req.query.activity : '';
        if (!activity) {
            res.status(400).json({ success: false, message: 'Le paramètre activity est requis.' });
            return;
        }
        const rows = await prisma_1.default.nouvelle_impression.findMany({
            where: {
                activity,
                type_pieces: { not: null }
            },
            distinct: ['type_pieces'],
            select: { type_pieces: true },
            orderBy: { type_pieces: 'asc' }
        });
        res.json(rows.map(r => r.type_pieces).filter((v) => Boolean(v)));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getTypePiecesOptions = getTypePiecesOptions;
const getAllLots = async (req, res) => {
    try {
        const activity = typeof req.query.activity === 'string' ? req.query.activity : '';
        const type_pieces = typeof req.query.type_pieces === 'string' ? req.query.type_pieces : '';
        if (!activity || !type_pieces) {
            res.status(400).json({ success: false, message: 'Les paramètres activity et type_pieces sont requis.' });
            return;
        }
        // Récupère tous les id_lot de fin_impression
        const finis = await prisma_1.default.fin_impression.findMany({
            select: { id_lot: true }
        });
        // Liste des ids déjà utilisés
        const idsUtilises = finis.map(item => item.id_lot);
        // Récupère tous les lots qui ne sont PAS dans fin_impression
        const results = await prisma_1.default.nouvelle_impression.findMany({
            where: {
                id: { notIn: idsUtilises },
                activity,
                type_pieces
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
            select: { nb_pieces: true, num_lot_wafer: true, type_pieces: true, activity: true }
        });
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getLotDetails = getLotDetails;
