"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDebutPreassemblageIds = exports.getDebutPreassemblageById = exports.listDebutPreassemblage = exports.createDebutPreassemblage = exports.getPiecesDisponiblesByLot = exports.getAvailableLotsForReference = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const s = (v) => (v === undefined || v === null ? "" : String(v).trim());
/**
 * GET /api/debutpreassemblage/lots-disponibles?reference=XXX
 * -> lots dispo depuis lot_status
 */
const getAvailableLotsForReference = async (req, res) => {
    try {
        const reference = req.query.reference;
        if (!reference || typeof reference !== "string") {
            res.status(400).json({ error: 'Paramètre "reference" obligatoire' });
            return;
        }
        const lots = await prisma_1.default.lot_status.findMany({
            where: {
                type_piece: reference,
                current_step: "pret_assemblage",
                disponible_finis: true,
            },
            select: { id_lot: true },
            orderBy: { id_lot: "asc" },
        });
        res.json(lots);
    }
    catch (err) {
        console.error("Erreur getAvailableLotsForReference:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.getAvailableLotsForReference = getAvailableLotsForReference;
/**
 * GET /api/debutpreassemblage/pieces-disponibles?id_lot=2
 * -> nb_piece_conforme depuis fin_etching (id_lot unique)
 */
const getPiecesDisponiblesByLot = async (req, res) => {
    try {
        const raw = req.query.id_lot;
        if (raw === undefined) {
            res.status(400).json({ error: 'Paramètre "id_lot" obligatoire' });
            return;
        }
        const idLot = Number(raw);
        if (!Number.isFinite(idLot) || idLot <= 0) {
            res.status(400).json({ error: 'Paramètre "id_lot" invalide' });
            return;
        }
        const row = await prisma_1.default.fin_etching.findUnique({
            where: { id_lot: idLot },
            select: { nb_piece_conforme: true },
        });
        res.json({
            id_lot: idLot,
            nb_piece_disponible: row?.nb_piece_conforme ?? 0,
        });
    }
    catch (err) {
        console.error("Erreur getPiecesDisponiblesByLot:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.getPiecesDisponiblesByLot = getPiecesDisponiblesByLot;
/**
 * POST /api/debutpreassemblage
 * body:
 * {
 *   activite: "PROD",
 *   produit_fini: "SK",
 *   lot_corps: 2,
 *   date: "2026-01-19",
 *   operateur: "OBO",
 *   piece_disponible: 8,
 *   quantite_utilisee: 5,
 *   commentaire: "",
 *   references: [{ reference_nom:"CSK", lot_valeur:"2" }, ...],
 *   pieces: ["CSK-002-01", ...]
 * }
 */
const createDebutPreassemblage = async (req, res) => {
    try {
        const activite = s(req.body.activite);
        const produit_fini = s(req.body.produit_fini);
        const lot_corps_raw = req.body.lot_corps;
        const dateStr = s(req.body.date);
        const operateur = s(req.body.operateur);
        const piece_disponible = Number(req.body.piece_disponible ?? 0);
        const quantite_utilisee = Number(req.body.quantite_utilisee ?? 0);
        const commentaire = s(req.body.commentaire);
        if (!activite || !produit_fini || !dateStr || !operateur) {
            res.status(400).json({ error: "Champs obligatoires manquants" });
            return;
        }
        const lot_corps = Number(lot_corps_raw);
        if (!Number.isFinite(lot_corps) || lot_corps <= 0) {
            res.status(400).json({ error: "lot_corps invalide" });
            return;
        }
        const id_debutpreassemblage = `ASM-${produit_fini}-${lot_corps}`;
        // bloque doublon (PK)
        const exists = await prisma_1.default.debut_preassemblage.findUnique({
            where: { id_debutpreassemblage },
            select: { id_debutpreassemblage: true },
        });
        if (exists) {
            res.status(409).json({
                error: "Ce début pré-assemblage existe déjà",
                id_debutpreassemblage,
            });
            return;
        }
        // references: [{reference_nom, lot_valeur}]
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
                return false; // évite doublon payload
            seen.add(r.reference_nom);
            return true;
        });
        const piecesInput = Array.isArray(req.body.pieces) ? req.body.pieces : [];
        const piecesCreate = piecesInput
            .map((p) => s(p))
            .filter(Boolean)
            .map((piece_code) => ({ piece_code }));
        // (optionnel) cohérence : quantite_utilisee = nb pièces cochées
        const quantiteFinale = piecesCreate.length;
        const created = await prisma_1.default.debut_preassemblage.create({
            data: {
                id_debutpreassemblage,
                activite,
                produit_fini,
                lot_corps,
                date: new Date(dateStr),
                operateur,
                piece_disponible: Number.isFinite(piece_disponible) ? piece_disponible : 0,
                quantite_utilisee: quantiteFinale,
                commentaire: commentaire || null,
                references: { create: refsCreate },
                pieces: { create: piecesCreate },
            },
            select: { id_debutpreassemblage: true },
        });
        res.json(created);
    }
    catch (err) {
        console.error("Erreur createDebutPreassemblage:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.createDebutPreassemblage = createDebutPreassemblage;
/**
 * GET /api/debutpreassemblage
 * -> liste pour select étape suivante
 */
const listDebutPreassemblage = async (_req, res) => {
    try {
        const rows = await prisma_1.default.debut_preassemblage.findMany({
            orderBy: { created_at: "desc" },
            select: {
                id_debutpreassemblage: true,
                activite: true,
                produit_fini: true,
                lot_corps: true,
                date: true,
                operateur: true,
                piece_disponible: true,
                quantite_utilisee: true,
                created_at: true,
            },
        });
        res.json(rows);
    }
    catch (err) {
        console.error("Erreur listDebutPreassemblage:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.listDebutPreassemblage = listDebutPreassemblage;
/**
 * GET /api/debutpreassemblage/:id
 * -> récupérer tout (main + refs + pièces)
 */
const getDebutPreassemblageById = async (req, res) => {
    try {
        const id = s(req.params.id);
        const row = await prisma_1.default.debut_preassemblage.findUnique({
            where: { id_debutpreassemblage: id },
            select: {
                id_debutpreassemblage: true,
                activite: true,
                produit_fini: true,
                lot_corps: true,
                piece_disponible: true,
                quantite_utilisee: true,
                references: {
                    select: {
                        reference_nom: true,
                        lot_valeur: true,
                    },
                },
                pieces: {
                    select: {
                        piece_code: true,
                    },
                },
            },
        });
        if (!row) {
            res.status(404).json({ error: "Introuvable" });
            return;
        }
        res.json(row);
    }
    catch (err) {
        console.error("Erreur getDebutPreassemblageById:", err);
        res.status(500).json({
            error: "Erreur serveur",
            details: err?.message ?? String(err),
        });
    }
};
exports.getDebutPreassemblageById = getDebutPreassemblageById;
// GET /api/debutpreassemblage/listeIds?activite=...&produit_fini=...
const listDebutPreassemblageIds = async (req, res) => {
    try {
        const activite = typeof req.query.activite === "string" ? req.query.activite.trim() : "";
        const produit_fini = typeof req.query.produit_fini === "string" ? req.query.produit_fini.trim() : "";
        const where = {};
        if (activite)
            where.activite = activite;
        if (produit_fini)
            where.produit_fini = produit_fini;
        const rows = await prisma_1.default.debut_preassemblage.findMany({
            orderBy: { created_at: "desc" },
            where,
            select: { id_debutpreassemblage: true },
        });
        res.json(rows.map((r) => r.id_debutpreassemblage));
    }
    catch (err) {
        console.error("Erreur listDebutPreassemblageIds:", err);
        res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
    }
};
exports.listDebutPreassemblageIds = listDebutPreassemblageIds;
