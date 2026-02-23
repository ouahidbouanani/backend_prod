"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDebutAssemblageIds = exports.getPreassemblagePiecesForDebutAssemblage = exports.getAvailableLotsForReference = exports.getDebutAssemblageById = exports.createDebutAssemblage = void 0;
const client_1 = require("@prisma/client");
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
        const activite = s(req.body.activite);
        const produit_fini = s(req.body.produit_fini);
        const lot_asm = s(req.body.lot_asm);
        const dateStr = s(req.body.date);
        const operateur = s(req.body.operateur);
        const piece_disponible = Number(req.body.piece_disponible ?? 0);
        const quantite_utilisee = Number(req.body.quantite_utilisee ?? 0);
        const commentaire = s(req.body.commentaire);
        if (!activite || !produit_fini || !lot_asm || !dateStr || !operateur) {
            res.status(400).json({ error: "Champs obligatoires manquants" });
            return;
        }
        // Empêche la réutilisation du même LOT ASM (même si id_debutassemblage est différent)
        const lotAlreadyUsed = await prisma_1.default.debut_assemblage.findFirst({
            where: { lot_asm },
            select: { id_debutassemblage: true, lot_asm: true },
        });
        if (lotAlreadyUsed) {
            res.status(409).json({
                error: "Ce LOT ASM est déjà utilisé (début assemblage déjà créé)",
                lot_asm,
                id_debutassemblage: lotAlreadyUsed.id_debutassemblage,
            });
            return;
        }
        const produitFiniForId = produit_fini
            .trim()
            .replace(/\s+/g, "-")
            .toUpperCase();
        const prefix = `ASM-${produitFiniForId}-`;
        const computeNextId = async () => {
            const rows = await prisma_1.default.debut_assemblage.findMany({
                where: {
                    produit_fini,
                    id_debutassemblage: { startsWith: prefix },
                },
                select: { id_debutassemblage: true },
            });
            let max = -1;
            for (const r of rows) {
                const id = s(r.id_debutassemblage);
                if (!id.startsWith(prefix))
                    continue;
                const tail = id.slice(prefix.length);
                const n = Number(tail);
                if (Number.isFinite(n))
                    max = Math.max(max, n);
            }
            const next = Math.max(1000, max + 1);
            return `${prefix}${next}`;
        };
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
        let created = null;
        for (let attempt = 0; attempt < 5; attempt++) {
            const id_debutassemblage = await computeNextId();
            try {
                created = await prisma_1.default.debut_assemblage.create({
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
                break;
            }
            catch (e) {
                if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
                    continue;
                }
                throw e;
            }
        }
        if (!created) {
            res.status(500).json({ error: "Impossible de générer un ID unique" });
            return;
        }
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
 * GET /api/debutassemblage/preassemblage/:id
 * Récupère les pièces validées (QC) depuis la table fin_preassemblage_piece
 * en utilisant uniquement l'id_debutpreassemblage.
 */
const getPreassemblagePiecesForDebutAssemblage = async (req, res) => {
    try {
        const id = s(req.params.id);
        if (!id) {
            res.status(400).json({ error: "id manquant" });
            return;
        }
        const references = await prisma_1.default.debut_preassemblage_reference.findMany({
            where: { id_debutpreassemblage: id },
            select: { reference_nom: true, lot_valeur: true },
            orderBy: { reference_nom: "asc" },
        });
        const pieces = await prisma_1.default.fin_preassemblage_piece.findMany({
            where: {
                id_finpreassemblage: id,
                qc_ok: true,
            },
            select: {
                piece_code: true,
            },
            orderBy: { piece_code: "asc" },
        });
        res.json({
            id_debutpreassemblage: id,
            quantite_utilisee: pieces.length,
            references,
            pieces,
        });
    }
    catch (err) {
        console.error("Erreur getPreassemblagePiecesForDebutAssemblage:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.getPreassemblagePiecesForDebutAssemblage = getPreassemblagePiecesForDebutAssemblage;
/**
 * GET /api/debutassemblage/ids
 */
const listDebutAssemblageIds = async (_req, res) => {
    try {
        const req = _req;
        const activite = typeof req.query.activite === "string" ? req.query.activite.trim() : "";
        const produit_fini = typeof req.query.produit_fini === "string" ? req.query.produit_fini.trim() : "";
        const where = {};
        if (activite)
            where.activite = activite;
        if (produit_fini)
            where.produit_fini = produit_fini;
        // Exclure les dossiers déjà soumis (présents dans fin_assemblage).
        // `fin_assemblage.id_finassemblage` référence `debut_assemblage.id_debutassemblage`.
        const submitted = await prisma_1.default.fin_assemblage.findMany({
            select: { id_finassemblage: true },
        });
        const submittedIds = submitted.map((r) => r.id_finassemblage);
        if (submittedIds.length > 0) {
            where.id_debutassemblage = { notIn: submittedIds };
        }
        const rows = await prisma_1.default.debut_assemblage.findMany({
            where,
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
