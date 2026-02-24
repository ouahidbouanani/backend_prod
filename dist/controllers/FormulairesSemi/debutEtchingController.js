"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNbPassages = exports.getAllDebutEtching = exports.addDebutEtching = exports.getLots = exports.getTypePiecesOptions = exports.getActivities = void 0;
const client_1 = require("@prisma/client");
// ============================================
// controllers/FormulairesSemi/debutEtchingController.js
// ============================================
const prisma_1 = __importDefault(require("../../config/prisma"));
const getActivities = async (req, res) => {
    try {
        // Distinct activities from fin_impression, fallback to lot_status for older rows
        const rows = await prisma_1.default.$queryRaw(client_1.Prisma.sql `
      SELECT DISTINCT COALESCE(fi.activity, ls.activity) AS activity
      FROM fin_impression fi
      LEFT JOIN lot_status ls ON ls.id_lot = fi.id_lot
      WHERE COALESCE(fi.activity, ls.activity) IS NOT NULL
      ORDER BY activity ASC
    `);
        res.json(rows.map(r => r.activity).filter((v) => Boolean(v)));
    }
    catch (err) {
        console.error('Erreur lors du chargement des activités:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
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
        // Distinct type_pieces from fin_impression, fallback to lot_status.type_piece for older rows
        const rows = await prisma_1.default.$queryRaw(client_1.Prisma.sql `
      SELECT DISTINCT COALESCE(fi.type_pieces, ls.type_piece) AS type_pieces
      FROM fin_impression fi
      LEFT JOIN lot_status ls ON ls.id_lot = fi.id_lot
      WHERE COALESCE(fi.activity, ls.activity) = ${activity}
        AND COALESCE(fi.type_pieces, ls.type_piece) IS NOT NULL
      ORDER BY type_pieces ASC
    `);
        res.json(rows.map(r => r.type_pieces).filter((v) => Boolean(v)));
    }
    catch (err) {
        console.error('Erreur lors du chargement des types:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.getTypePiecesOptions = getTypePiecesOptions;
const getLots = async (req, res) => {
    try {
        const activity = typeof req.query.activity === 'string' ? req.query.activity : '';
        const type_pieces = typeof req.query.type_pieces === 'string' ? req.query.type_pieces : '';
        if (!activity || !type_pieces) {
            res.status(400).json({ success: false, message: 'Les paramètres activity et type_pieces sont requis.' });
            return;
        }
        // 1. Récupérer tous les id_lot présents dans fin_etching
        const etchingLots = await prisma_1.default.fin_etching.findMany({
            select: { id_lot: true }
        });
        // 2. Extraire les id dans un tableau
        const idsEtching = etchingLots.map(item => item.id_lot);
        // 3. Récupérer les lots dans fin_impression (filtrés activity/type_pieces)
        //    dont id_lot n'est PAS dans fin_etching
        //    Fallback: si fi.activity/fi.type_pieces est NULL, utiliser lot_status.
        const baseQuery = client_1.Prisma.sql `
      SELECT
        fi.id_lot,
        fi.num_lot_wafer,
        fi.nb_imprimees,
        COALESCE(fi.activity, ls.activity) AS activity,
        COALESCE(fi.type_pieces, ls.type_piece) AS type_pieces
      FROM fin_impression fi
      LEFT JOIN lot_status ls ON ls.id_lot = fi.id_lot
      WHERE COALESCE(fi.activity, ls.activity) = ${activity}
        AND COALESCE(fi.type_pieces, ls.type_piece) = ${type_pieces}
    `;
        const results = idsEtching.length > 0
            ? await prisma_1.default.$queryRaw(client_1.Prisma.sql `${baseQuery} AND fi.id_lot NOT IN (${client_1.Prisma.join(idsEtching)})`)
            : await prisma_1.default.$queryRaw(baseQuery);
        res.status(200).json(results);
    }
    catch (err) {
        console.error('Erreur lors de la récupération des lots:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.getLots = getLots;
const addDebutEtching = async (req, res) => {
    try {
        const { numeroLot, activity, type_pieces, num_lot_wafer, nb_pieces, operateur, nb_passage, date_debut, heure_debut, temps_reel, koh, bain, position, commentaire } = req.body;
        await prisma_1.default.$transaction(async (tx) => {
            await tx.debut_etching.create({
                data: {
                    id_lot: numeroLot,
                    num_lot_wafer,
                    nb_pieces,
                    operateur,
                    nb_passage,
                    date_debut,
                    heure_debut,
                    temps_reel,
                    koh,
                    bain,
                    position,
                    commentaire
                }
            });
            // Renseigner activity/type_pieces via SQL pour rester compatible
            // même si Prisma Client n'a pas encore été régénéré.
            if (activity || type_pieces) {
                await tx.$executeRaw `
          UPDATE debut_etching
          SET activity = ${activity ?? null},
              type_pieces = ${type_pieces ?? null}
          WHERE id_lot = ${numeroLot} AND nb_passage = ${nb_passage}
        `;
            }
            await tx.lot_status.update({
                where: { id_lot: numeroLot },
                data: { current_step: 'prise_de_cotes' },
            });
        });
        res.status(200).json({ success: true, message: '✅ Données enregistrées avec succès.' });
    }
    catch (err) {
        console.error("Erreur lors de l'insertion dans debut_etching:", err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.addDebutEtching = addDebutEtching;
const getAllDebutEtching = async (req, res) => {
    try {
        const results = await prisma_1.default.debut_etching.findMany();
        const formattedResults = results.map(row => ({
            ...row,
            date_debut: row.date_debut ? new Date(row.date_debut).toISOString().split('T')[0].replace(/-/g, '/') : null,
            heure_debut: row.heure_debut ? new Date(row.heure_debut).toTimeString().slice(0, 5) : null
        }));
        res.json(formattedResults);
    }
    catch (err) {
        console.error('Erreur lors de la récupération des données :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getAllDebutEtching = getAllDebutEtching;
const getNbPassages = async (req, res) => {
    try {
        const lotId = parseInt(req.params.lotId);
        const count = await prisma_1.default.debut_etching.count({
            where: { id_lot: lotId }
        });
        res.json({ count });
    }
    catch (err) {
        console.error('Erreur lors du comptage des passages :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getNbPassages = getNbPassages;
