"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMesuresByLotAndPassage = exports.ajouterPriseCotes = exports.GetTypePiece = exports.submitPieces = exports.getLots = void 0;
// ============================================
// controllers/FormulairesSemi/priseCotesController.js
// ============================================
const prisma_1 = __importDefault(require("../../config/prisma"));
const getLots = async (req, res) => {
    try {
        // 1. Lots déjà terminés (fin_etching) -> à exclure
        const lotsFinis = await prisma_1.default.fin_etching.findMany({
            select: { id_lot: true },
        });
        const lotsExclus = lotsFinis.map((l) => l.id_lot);
        // 2. Toutes les lignes de debut_etching pour les lots NON terminés
        const debutRows = await prisma_1.default.debut_etching.findMany({
            where: {
                id_lot: { notIn: lotsExclus }, // exclure les lots en fin_etching
            },
            select: {
                id_lot: true,
                nb_passage: true,
            },
            orderBy: {
                id_lot: "asc",
            },
        });
        // 3. Toutes les prises de cotes (pour savoir jusqu'où on a validé)
        const prises = await prisma_1.default.prise_de_cotes.findMany({
            select: {
                id_lot: true,
                nb_passage: true,
            },
        });
        // Set de couples (id_lot, nb_passage) déjà mesurés
        const prisesSet = new Set(prises.map((p) => `${p.id_lot}-${p.nb_passage}`));
        // Map : id_lot -> passage max déjà mesuré
        const maxPassageMap = new Map();
        for (const p of prises) {
            const current = maxPassageMap.get(p.id_lot) ?? 0;
            if (p.nb_passage > current) {
                maxPassageMap.set(p.id_lot, p.nb_passage);
            }
        }
        // 4. On garde uniquement :
        //    - les (id_lot, nb_passage) SANS prise de cote
        //    - ET nb_passage > dernier passage mesuré pour ce lot
        const debutFiltres = debutRows.filter((row) => {
            const maxValide = maxPassageMap.get(row.id_lot) ?? 0;
            // si ce passage est déjà mesuré -> on ne garde pas
            if (prisesSet.has(`${row.id_lot}-${row.nb_passage}`)) {
                return false;
            }
            // si ce passage est <= dernier passage mesuré -> on ne garde pas
            if (row.nb_passage <= maxValide) {
                return false;
            }
            // sinon, il est encore à faire
            return true;
        });
        // 5. Récupérer nb_imprimees par lot
        const fins = await prisma_1.default.fin_impression.findMany({
            select: {
                id_lot: true,
                nb_imprimees: true,
            },
        });
        const finMap = new Map(fins.map((f) => [f.id_lot, f.nb_imprimees]));
        // 6. Regrouper par lot + liste des passages
        const groupedObj = {};
        for (const row of debutFiltres) {
            if (!groupedObj[row.id_lot]) {
                groupedObj[row.id_lot] = {
                    id_lot: row.id_lot,
                    nb_passages: [],
                    nb_imprimees: finMap.get(row.id_lot) ?? null,
                };
            }
            groupedObj[row.id_lot].nb_passages.push(row.nb_passage);
        }
        const grouped = Object.values(groupedObj).map((lot) => ({
            ...lot,
            nb_passages: lot.nb_passages.sort((a, b) => a - b),
        }));
        res.json(grouped);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.getLots = getLots;
const submitPieces = async (req, res) => {
    try {
        const { id_lot, passage, date, nombre_pieces, pieces } = req.body;
        await prisma_1.default.$transaction(async (tx) => {
            // 1. Insérer dans prise_de_cotes
            await tx.prise_de_cotes.create({
                data: {
                    id_lot,
                    nb_passage: passage,
                    date: new Date(date),
                    nombre_pieces
                }
            });
            // 2. Insérer les mesures
            if (pieces && pieces.length > 0) {
                await tx.mesure_cote_piece.createMany({
                    data: pieces.map(p => ({
                        id_lot,
                        nb_passage: passage,
                        id_piece_locale: p.id_piece,
                        id_cote_piece: p.id_cote || 0,
                        valeur: p.coteA || 0
                    }))
                });
            }
            // 3. Mettre à jour le statut
            await tx.lot_status.update({
                where: { id_lot: id_lot },
                data: { current_step: 'fin_etching' }
            });
        });
        res.status(200).json({ success: true, message: '✅ Données enregistrées avec succès.' });
    }
    catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ error: err.message });
    }
};
exports.submitPieces = submitPieces;
const GetTypePiece = async (req, res) => {
    try {
        const id_lot = parseInt(req.params.id_lot);
        // 1. Récupérer le type de pièce depuis nouvelle_impression
        const lot = await prisma_1.default.nouvelle_impression.findUnique({
            where: { id: id_lot },
            select: { type_pieces: true }
        });
        if (!lot) {
            return res.status(404).json({ message: "Lot introuvable." });
        }
        const nom_piece = lot.type_pieces;
        // 2. Trouver l'id de cette pièce
        const piece = await prisma_1.default.piece.findUnique({
            where: { nom: nom_piece },
            select: { id: true }
        });
        if (!piece) {
            return res.status(404).json({ message: "Pièce introuvable." });
        }
        // 3. Récupérer les cotes
        const cotes = await prisma_1.default.cote_piece.findMany({
            where: { piece_id: piece.id },
            select: {
                id: true,
                nom_cote: true,
                tolerance_min: true,
                tolerance_max: true
            }
        });
        res.json({ nom_piece, cotes });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.GetTypePiece = GetTypePiece;
const ajouterPriseCotes = async (req, res) => {
    try {
        const { id_lot, nb_passage, date, type_piece, nombre_pieces, pieces } = req.body;
        await prisma_1.default.$transaction(async (tx) => {
            // Insérer prise de cotes
            await tx.prise_de_cotes.create({
                data: {
                    id_lot,
                    nb_passage: Number(nb_passage),
                    type_piece,
                    date: new Date(date),
                    nombre_pieces
                }
            });
            // Récupérer l'id de la pièce
            const piece = await tx.piece.findUnique({
                where: { nom: type_piece },
                select: { id: true }
            });
            if (!piece) {
                throw new Error('Type pièce non trouvé');
            }
            // Récupérer les cotes de la pièce
            const cotes = await tx.cote_piece.findMany({
                where: { piece_id: piece.id },
                select: { id: true, nom_cote: true }
            });
            // Insérer les mesures
            const mesures = [];
            for (const p of pieces) {
                for (const cote of cotes) {
                    const valeur = p[cote.nom_cote];
                    if (valeur !== undefined) {
                        mesures.push({
                            id_lot,
                            nb_passage,
                            id_piece_locale: p.id_piece,
                            id_cote_piece: cote.id,
                            valeur: parseInt(valeur)
                        });
                    }
                }
            }
            if (mesures.length > 0) {
                await tx.mesure_cote_piece.createMany({
                    data: mesures
                });
            }
        });
        res.status(201).json({ message: 'Mesures enregistrées avec succès' });
    }
    catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ error: err.message });
    }
};
exports.ajouterPriseCotes = ajouterPriseCotes;
const getMesuresByLotAndPassage = async (req, res) => {
    try {
        const { id_lot, nb_passage } = req.params;
        const query = `
            SELECT 
                m.id_piece_locale, 
                c.nom_cote, 
                c.tolerance_min, 
                c.tolerance_max, 
                m.valeur 
            FROM mesure_cote_piece m 
            JOIN cote_piece c ON m.id_cote_piece = c.id 
            WHERE m.id_lot = ? AND m.nb_passage = ? 
            ORDER BY m.id_piece_locale, c.nom_cote
        `;
        const results = await prisma_1.default.$queryRawUnsafe(query, parseInt(id_lot), parseInt(nb_passage));
        res.status(200).json(results);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la récupération des mesures" });
    }
};
exports.getMesuresByLotAndPassage = getMesuresByLotAndPassage;
