"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFinEtching = exports.getLotInfo = exports.getLots = exports.getTypePiecesOptions = exports.getActivities = void 0;
// ============================================
// controllers/FormulairesSemi/finEtchingController.js
// ============================================
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../config/prisma"));
const getActivities = async (req, res) => {
    try {
        const lotsFinis = await prisma_1.default.fin_etching.findMany({
            select: { id_lot: true }
        });
        const idsFinis = lotsFinis.map(l => l.id_lot);
        const base = client_1.Prisma.sql `
            SELECT DISTINCT COALESCE(de.activity, ls.activity) AS activity
            FROM prise_de_cotes pc
            LEFT JOIN debut_etching de ON de.id_lot = pc.id_lot
            LEFT JOIN lot_status ls ON ls.id_lot = pc.id_lot
            WHERE COALESCE(de.activity, ls.activity) IS NOT NULL
        `;
        const rows = idsFinis.length > 0
            ? await prisma_1.default.$queryRaw(client_1.Prisma.sql `${base} AND pc.id_lot NOT IN (${client_1.Prisma.join(idsFinis)}) ORDER BY activity ASC`)
            : await prisma_1.default.$queryRaw(client_1.Prisma.sql `${base} ORDER BY activity ASC`);
        res.json(rows.map(r => r.activity).filter((v) => Boolean(v)));
    }
    catch (err) {
        console.error('Erreur lors de la récupération des activités:', err);
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
        const lotsFinis = await prisma_1.default.fin_etching.findMany({
            select: { id_lot: true }
        });
        const idsFinis = lotsFinis.map(l => l.id_lot);
        const base = client_1.Prisma.sql `
            SELECT DISTINCT COALESCE(de.type_pieces, ls.type_piece) AS type_pieces
            FROM prise_de_cotes pc
            LEFT JOIN debut_etching de ON de.id_lot = pc.id_lot
            LEFT JOIN lot_status ls ON ls.id_lot = pc.id_lot
            WHERE COALESCE(de.activity, ls.activity) = ${activity}
              AND COALESCE(de.type_pieces, ls.type_piece) IS NOT NULL
        `;
        const rows = idsFinis.length > 0
            ? await prisma_1.default.$queryRaw(client_1.Prisma.sql `${base} AND pc.id_lot NOT IN (${client_1.Prisma.join(idsFinis)}) ORDER BY type_pieces ASC`)
            : await prisma_1.default.$queryRaw(client_1.Prisma.sql `${base} ORDER BY type_pieces ASC`);
        res.json(rows.map(r => r.type_pieces).filter((v) => Boolean(v)));
    }
    catch (err) {
        console.error('Erreur lors de la récupération des types:', err);
        res.status(500).json({ error: 'Erreur serveur' });
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
        // 1. Récupérer tous les lots finis (à exclure)
        const lotsFinis = await prisma_1.default.fin_etching.findMany({
            select: { id_lot: true }
        });
        const idsFinis = lotsFinis.map(l => l.id_lot);
        // 2. Lots ayant AU MOINS une prise_de_cotes, filtrés par activity/type_pieces
        //    Fallback: debut_etching / lot_status
        const base = client_1.Prisma.sql `
            SELECT DISTINCT pc.id_lot
            FROM prise_de_cotes pc
            LEFT JOIN debut_etching de ON de.id_lot = pc.id_lot
            LEFT JOIN lot_status ls ON ls.id_lot = pc.id_lot
            WHERE COALESCE(de.activity, ls.activity) = ${activity}
              AND COALESCE(de.type_pieces, ls.type_piece) = ${type_pieces}
        `;
        const results = idsFinis.length > 0
            ? await prisma_1.default.$queryRaw(client_1.Prisma.sql `${base} AND pc.id_lot NOT IN (${client_1.Prisma.join(idsFinis)}) ORDER BY pc.id_lot ASC`)
            : await prisma_1.default.$queryRaw(client_1.Prisma.sql `${base} ORDER BY pc.id_lot ASC`);
        res.json(results);
    }
    catch (err) {
        console.error("Erreur lors de la récupération des lots:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.getLots = getLots;
const getLotInfo = async (req, res) => {
    try {
        const lotId = parseInt(req.params.lotId);
        const result = await prisma_1.default.debut_etching.findFirst({
            where: { id_lot: lotId },
            select: { num_lot_wafer: true, nb_passage: true },
            orderBy: { nb_passage: 'desc' }
        });
        if (!result) {
            return res.status(404).json({ error: 'Lot introuvable' });
        }
        res.json(result);
    }
    catch (err) {
        console.error('Erreur récupération lot:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getLotInfo = getLotInfo;
const addFinEtching = async (req, res) => {
    try {
        const { id_lot, activity, type_pieces, num_lot_wafer, nb_passage, date_fin, heure_fin, nb_piece_conforme, operateur, commentaire } = req.body;
        await prisma_1.default.$transaction(async (tx) => {
            await tx.fin_etching.create({
                data: {
                    id_lot, num_lot_wafer, nb_passage,
                    date_fin, heure_fin,
                    nb_piece_conforme, operateur, commentaire
                }
            });
            // Renseigner activity/type_pieces via SQL pour rester compatible
            // même si Prisma Client n'a pas encore été régénéré.
            if (activity || type_pieces) {
                await tx.$executeRaw `
                  UPDATE fin_etching
                  SET activity = ${activity ?? null},
                      type_pieces = ${type_pieces ?? null}
                  WHERE id_lot = ${id_lot}
                `;
            }
            // On récupère le lot_status existant
            const lotStatus = await tx.lot_status.findUnique({
                where: { id_lot },
            });
            if (!lotStatus) {
                // Si pas trouvé, on considère que c’est une erreur métier
                throw new Error(`lot_status introuvable pour id_lot=${id_lot}`);
            }
            // Vérifie si c’est un nozzle (type_piece commence par "N")
            if (lotStatus.type_piece && lotStatus.type_piece.startsWith('N')) {
                // Nozzle : on passe en "pret_assemblage" + disponible_finis = true
                await tx.lot_status.update({
                    where: { id_lot },
                    data: {
                        current_step: 'pret_assemblage',
                        disponible_finis: true,
                    },
                });
            }
            else {
                // Autres types : on garde ton ancien comportement (debut_tomo)
                await tx.lot_status.update({
                    where: { id_lot },
                    data: {
                        current_step: 'debut_tomo',
                    },
                });
            }
        });
        res.status(200).json({ message: '✅ Données enregistrées avec succès.' });
    }
    catch (err) {
        console.error('Erreur ajout fin etching:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.addFinEtching = addFinEtching;
