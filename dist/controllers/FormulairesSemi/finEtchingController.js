"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFinEtching = exports.getLotInfo = exports.getLots = void 0;
// ============================================
// controllers/FormulairesSemi/finEtchingController.js
// ============================================
const prisma_1 = __importDefault(require("../../config/prisma"));
const getLots = async (req, res) => {
    try {
        // 1. Récupérer tous les lots finis (à exclure)
        const lotsFinis = await prisma_1.default.fin_etching.findMany({
            select: { id_lot: true }
        });
        const idsFinis = lotsFinis.map(l => l.id_lot);
        // 2. Récupérer tous les lots ayant AU MOINS une prise_de_cotes
        const lotsAvecPrises = await prisma_1.default.prise_de_cotes.findMany({
            select: { id_lot: true },
            distinct: ['id_lot'] // évite les doublons
        });
        // 3. Filtrer côté JS les lots NON présents dans fin_etching
        const results = lotsAvecPrises
            .filter(lot => !idsFinis.includes(lot.id_lot));
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
        const { id_lot, num_lot_wafer, nb_passage, date_fin, heure_fin, nb_piece_conforme, operateur, commentaire } = req.body;
        await prisma_1.default.$transaction(async (tx) => {
            await tx.fin_etching.create({
                data: {
                    id_lot, num_lot_wafer, nb_passage,
                    date_fin, heure_fin,
                    nb_piece_conforme, operateur, commentaire
                }
            });
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
