"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDebutAssemblageIds = exports.getAvailableLotsForReference = exports.getDebutAssemblageById = exports.createDebutAssemblage = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const s = (v) => (typeof v === "string" ? v.trim() : "");
/**
 * POST /api/debutassemblage
 * body:
 * {
 *   id_debutassemblage: "ASM-SK-2",
 *   activite: "PROD",
 *   produit_fini: "SK",
 *   lot_asm: "ASM-SK-2",
 *   date: "2026-01-19",
 *   operateur: "OBO",
 *   piece_disponible: 8,
 *   quantite_utilisee: 4,
 *   commentaire: "",
 *   references: [{ reference_nom:"CSK", lot_valeur:"2" }, ...],
 *   pieces: ["CSK-002-01", ...]
 * }
 */
const createDebutAssemblage = async (req, res) => {
    try {
        const id_debutassemblage = s(req.body.id_debutassemblage || req.body.lot_asm);
        const activite = s(req.body.activite);
        const produit_fini = s(req.body.produit_fini);
        const lot_asm = s(req.body.lot_asm || id_debutassemblage);
        const dateStr = s(req.body.date);
        const operateur = s(req.body.operateur);
        const piece_disponible = Number(req.body.piece_disponible ?? 0);
        const quantite_utilisee = Number(req.body.quantite_utilisee ?? 0);
        const commentaire = s(req.body.commentaire);
        if (!id_debutassemblage || !activite || !produit_fini || !lot_asm || !dateStr || !operateur) {
            res.status(400).json({ error: "Champs obligatoires manquants" });
            return;
        }
        const exists = await prisma_1.default.debut_assemblage.findUnique({
            where: { id_debutassemblage },
            select: { id_debutassemblage: true },
        });
        if (exists) {
            res.status(409).json({ error: "Ce début assemblage existe déjà", id_debutassemblage });
            return;
        }
        const refsInput = Array.isArray(req.body.references) ? req.body.references : [];
        const seen = new Set();
        const refsCreate = refsInput
            .map((r) => ({
            reference_nom: s(r.reference_nom ?? r.nom),
            lot_valeur: s(r.lot_valeur ?? (Array.isArray(r.valeurs) ? r.valeurs.filter(Boolean).join(",") : r.valeurs)),
        }))
            .filter((r) => r.reference_nom && r.lot_valeur)
            .filter((r) => {
            if (seen.has(r.reference_nom))
                return false;
            seen.add(r.reference_nom);
            return true;
        });
        const piecesInput = Array.isArray(req.body.pieces) ? req.body.pieces : [];
        const piecesCreate = piecesInput
            .map((p) => s(p))
            .filter(Boolean)
            .map((piece_code) => ({ piece_code }));
        const quantiteFinale = piecesCreate.length || quantite_utilisee;
        const created = await prisma_1.default.debut_assemblage.create({
            data: {
                id_debutassemblage,
                activite,
                produit_fini,
                lot_asm,
                date: new Date(dateStr),
                operateur,
                piece_disponible: Number.isFinite(piece_disponible) ? piece_disponible : 0,
                quantite_utilisee: Number.isFinite(quantiteFinale) ? quantiteFinale : 0,
                commentaire: commentaire || null,
                references: { create: refsCreate },
                pieces: { create: piecesCreate },
            },
            select: { id_debutassemblage: true },
        });
        res.json(created);
    }
    catch (err) {
        console.error("Erreur createDebutAssemblage:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.createDebutAssemblage = createDebutAssemblage;
/**
 * GET /api/debutassemblage/:id
 */
const getDebutAssemblageById = async (req, res) => {
    try {
        const id = s(req.params.id);
        if (!id) {
            res.status(400).json({ error: "id manquant" });
            return;
        }
        const row = await prisma_1.default.debut_assemblage.findUnique({
            where: { id_debutassemblage: id },
            include: {
                references: { select: { reference_nom: true, lot_valeur: true } },
                pieces: { select: { piece_code: true } },
            },
        });
        if (!row) {
            res.status(404).json({ error: "Introuvable" });
            return;
        }
        res.json(row);
    }
    catch (err) {
        console.error("Erreur getDebutAssemblageById:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.getDebutAssemblageById = getDebutAssemblageById;
const getAvailableLotsForReference = async (req, res) => {
    try {
        const reference = req.query.reference;
        if (!reference || typeof reference !== 'string') {
            res.status(400).json({ error: 'Paramètre "reference" obligatoire' });
            return;
        }
        const lots = await prisma_1.default.lot_status.findMany({
            where: {
                type_piece: reference, // ex: "N100"
                current_step: 'pret_assemblage',
                disponible_finis: true,
            },
            select: {
                id_lot: true
            },
        });
        res.json(lots);
    }
    catch (err) {
        console.error('Erreur lors de la récupération des lots disponibles :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getAvailableLotsForReference = getAvailableLotsForReference;
/**
 * GET /api/debutassemblage/ids
 */
const listDebutAssemblageIds = async (_req, res) => {
    try {
        const rows = await prisma_1.default.debut_assemblage.findMany({
            orderBy: { created_at: "desc" },
            select: { id_debutassemblage: true },
        });
        res.json(rows.map((r) => r.id_debutassemblage));
    }
    catch (err) {
        console.error("Erreur listDebutAssemblageIds:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.listDebutAssemblageIds = listDebutAssemblageIds;
