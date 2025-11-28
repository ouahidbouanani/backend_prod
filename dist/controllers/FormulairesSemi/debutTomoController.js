"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLots = exports.getAll = exports.create = void 0;
// ============================================
// controllers/FormulairesSemi/debutTomoController.js
// ============================================
const prisma_1 = __importDefault(require("../../config/prisma"));
const create = async (req, res) => {
    try {
        const { id_lot, nb_pieces, etage, date, heure_debut, operateur, num_machine, version, separation, commentaire } = req.body;
        await prisma_1.default.$transaction(async (tx) => {
            await tx.debut_tomo.create({
                data: {
                    id_lot: id_lot.toString(),
                    nb_pieces, etage,
                    date: new Date(date),
                    heure_debut: new Date(`1970-01-01T${heure_debut}`),
                    operateur, num_machine, version, separation, commentaire
                }
            });
            await tx.lot_status.upsert({
                where: { id_lot },
                update: { current_step: 'prise_de_cotes' },
                create: { id_lot, current_step: 'prise_de_cotes', type_piece: '', revision: '' }
            });
        });
        res.status(201).json({ message: 'Début de tomographie enregistré et statut mis à jour' });
    }
    catch (err) {
        console.error('Erreur d\'insertion :', err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement' });
    }
};
exports.create = create;
const getAll = async (req, res) => {
    try {
        const rows = await prisma_1.default.debut_tomo.findMany();
        res.json(rows);
    }
    catch (err) {
        console.error('Erreur de récupération :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getAll = getAll;
const getLots = async (req, res) => {
    try {
        // 1. Récupérer les lots de debut_tomo (à exclure)
        const lotsTomo = await prisma_1.default.debut_tomo.findMany({
            select: { id_lot: true }
        });
        // Convertir en number[]
        const idsTomo = lotsTomo
            .map(l => Number(l.id_lot))
            .filter(n => !isNaN(n));
        // 2. Récupérer les lots fin_etching qui ne sont pas dans debut_tomo
        const results = await prisma_1.default.fin_etching.findMany({
            where: {
                id_lot: {
                    notIn: idsTomo
                }
            },
            select: { id_lot: true }
        });
        res.json(results);
    }
    catch (err) {
        console.error('Erreur lors de la récupération des lots:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getLots = getLots;
