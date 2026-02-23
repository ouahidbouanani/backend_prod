"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinPreassemblageIdsDisponiblesPourDebutAssemblage = exports.getFinPreassemblageIds = exports.getFinPreassemblageById = exports.createFinPreassemblage = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
/**
 * POST /api/finpreassemblage  (CREATE ONLY)
 * body:
 * {
 *   id_finpreassemblage: "PSM-SK-01" (même valeur que l'id du début),
 *   date: "2026-01-20",
 *   operateur: "OBO",
 *   commentaire: null,
 *   pieces: [{ piece_code:"CSK-002-02", qc_ok:true }, ...]
 * }
 */
const createFinPreassemblage = async (req, res) => {
    try {
        const { activite, produit_fini, id_finpreassemblage, date, operateur, commentaire, pieces } = req.body;
        // ⚠️ id_finpreassemblage = l'id du dossier début (même valeur)
        const id_debutpreassemblage = id_finpreassemblage;
        // validations minimales
        if (!id_debutpreassemblage || !date || !operateur) {
            res.status(400).json({
                error: "Champs obligatoires: id_finpreassemblage, date, operateur",
            });
            return;
        }
        // 1) vérifier que le dossier DEBUT existe
        const debut = await prisma_1.default.debut_preassemblage.findUnique({
            where: { id_debutpreassemblage },
            select: { id_debutpreassemblage: true },
        });
        if (!debut) {
            res.status(404).json({ error: "Début pré-assemblage introuvable" });
            return;
        }
        // 2) empêcher double création FIN
        const already = await prisma_1.default.fin_preassemblage.findUnique({
            where: { id_finpreassemblage: id_debutpreassemblage },
            select: { id_finpreassemblage: true },
        });
        if (already) {
            res.status(409).json({
                error: "Fin pré-assemblage existe déjà pour ce dossier",
            });
            return;
        }
        // 3) Pièces autorisées = celles choisies dans le début (sécurité)
        const allowed = await prisma_1.default.debut_preassemblage_piece.findMany({
            where: { id_debutpreassemblage },
            select: { piece_code: true },
        });
        const allowedSet = new Set(allowed.map((p) => p.piece_code));
        const cleanedPieces = Array.isArray(pieces)
            ? pieces
                .map((p) => ({
                piece_code: p.piece_code,
                qc_ok: !!p.qc_ok,
            }))
                .filter((p) => p.piece_code && allowedSet.has(p.piece_code))
            : [];
        // 4) CREATE dans une transaction (header + lignes QC)
        const created = await prisma_1.default.$transaction(async (tx) => {
            const header = await tx.fin_preassemblage.create({
                data: {
                    id_finpreassemblage: id_debutpreassemblage,
                    activite: activite,
                    produit_fini: produit_fini,
                    date: new Date(date),
                    operateur,
                    commentaire: commentaire ?? null,
                },
                select: {
                    id_finpreassemblage: true,
                    date: true,
                    operateur: true,
                    commentaire: true,
                },
            });
            if (cleanedPieces.length > 0) {
                await tx.fin_preassemblage_piece.createMany({
                    data: cleanedPieces.map((p) => ({
                        id_finpreassemblage: id_debutpreassemblage,
                        piece_code: p.piece_code,
                        qc_ok: p.qc_ok,
                    })),
                });
            }
            return header;
        });
        res.status(201).json({
            ok: true,
            fin: created,
            qc_count: cleanedPieces.length,
        });
    }
    catch (err) {
        console.error("Erreur createFinPreassemblage:", err);
        res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
    }
};
exports.createFinPreassemblage = createFinPreassemblage;
/**
 * GET /api/finpreassemblage/:id
 * -> pour afficher / pré-remplir si besoin
 */
const getFinPreassemblageById = async (req, res) => {
    try {
        const id = req.params.id;
        const row = await prisma_1.default.fin_preassemblage.findUnique({
            where: { id_finpreassemblage: id },
            select: {
                id_finpreassemblage: true,
                date: true,
                operateur: true,
                commentaire: true,
                pieces: {
                    select: { piece_code: true, qc_ok: true },
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
        console.error("Erreur getFinPreassemblageById:", err);
        res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
    }
};
exports.getFinPreassemblageById = getFinPreassemblageById;
// GET /api/finpreassemblage/ids
const getFinPreassemblageIds = async (req, res) => {
    try {
        const ids = await prisma_1.default.fin_preassemblage.findMany({
            select: {
                id_finpreassemblage: true,
            },
        });
        // Optionnel : retourner juste un tableau de strings
        const result = ids.map((item) => item.id_finpreassemblage);
        res.json(result);
    }
    catch (err) {
        console.error("Erreur getFinPreassemblageIds:", err);
        res.status(500).json({
            error: "Erreur serveur",
            details: err?.message ?? String(err),
        });
    }
};
exports.getFinPreassemblageIds = getFinPreassemblageIds;
// GET /api/finpreassemblage/ids-disponibles-debut-assemblage
// Retourne les IDs fin_preassemblage qui ne sont pas encore utilisés comme LOT ASM dans debut_assemblage
const getFinPreassemblageIdsDisponiblesPourDebutAssemblage = async (req, res) => {
    try {
        const activite = typeof req.query.activite === "string" ? req.query.activite.trim() : "";
        const usedRows = await prisma_1.default.debut_assemblage.findMany({
            select: { lot_asm: true, id_debutassemblage: true },
        });
        const usedIds = Array.from(new Set(usedRows
            .flatMap((r) => [r.lot_asm, r.id_debutassemblage])
            .map((v) => (typeof v === "string" ? v.trim() : ""))
            .filter(Boolean)));
        const whereFin = {};
        if (activite)
            whereFin.activite = activite;
        if (usedIds.length)
            whereFin.id_finpreassemblage = { notIn: usedIds };
        const ids = await prisma_1.default.fin_preassemblage.findMany({
            where: Object.keys(whereFin).length ? whereFin : undefined,
            select: { id_finpreassemblage: true },
        });
        res.json(ids.map((item) => item.id_finpreassemblage));
    }
    catch (err) {
        console.error("Erreur getFinPreassemblageIdsDisponiblesPourDebutAssemblage:", err);
        res.status(500).json({
            error: "Erreur serveur",
            details: err?.message ?? String(err),
        });
    }
};
exports.getFinPreassemblageIdsDisponiblesPourDebutAssemblage = getFinPreassemblageIdsDisponiblesPourDebutAssemblage;
