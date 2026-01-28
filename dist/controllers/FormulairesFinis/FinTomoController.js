"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinTomoFinisById = exports.getLotsFinTomoFinis = exports.createFinTomoFinis = void 0;
// ============================================
// controllers/FormulairesFinis/FinTomoController.js
// ============================================
const prisma_1 = __importDefault(require("../../config/prisma"));
const s = (v) => (typeof v === 'string' ? v.trim() : '');
/**
 * POST /api/fin-tomo-finis
 * body:
 * {
 *   id_debuttomo: "ASM-001",
 *   date: "2026-01-20",
 *   heure: "14:30",
 *   operateur: "OBO",
 *   commentaire: ""
 * }
 */
const createFinTomoFinis = async (req, res) => {
    try {
        const id_debuttomo = s(req.body.id_debuttomo);
        const date = s(req.body.date);
        const heure = s(req.body.heure);
        const operateur = s(req.body.operateur);
        const commentaire = s(req.body.commentaire);
        if (!id_debuttomo || !date || !heure || !operateur) {
            res.status(400).json({ error: 'Champs obligatoires manquants' });
            return;
        }
        const debut = await prisma_1.default.debuttomo_finis.findUnique({
            where: { id_debuttomo },
            select: { id_debuttomo: true, activite: true, produit_fini: true, nb_puces_tomo: true },
        });
        if (!debut) {
            res.status(404).json({ error: 'Début tomo finis introuvable' });
            return;
        }
        const already = await prisma_1.default.fin_tomo_finis.findUnique({
            where: { id_debuttomo },
            select: { id_debuttomo: true },
        });
        if (already) {
            res.status(409).json({ error: 'Fin tomo existe déjà pour ce lot' });
            return;
        }
        const created = await prisma_1.default.fin_tomo_finis.create({
            data: {
                id_debuttomo,
                activite: debut.activite,
                produit_fini: debut.produit_fini,
                nb_puces_tomo: debut.nb_puces_tomo,
                date: new Date(date),
                heure: new Date(`1970-01-01T${heure}`),
                operateur,
                commentaire: commentaire || null,
            },
            select: { id_debuttomo: true },
        });
        res.status(201).json(created);
    }
    catch (err) {
        console.error('Erreur createFinTomoFinis:', err);
        res.status(500).json({ error: 'Erreur serveur', details: err?.message ?? String(err) });
    }
};
exports.createFinTomoFinis = createFinTomoFinis;
/**
 * GET /api/fin-tomo-finis/lots
 * Retourne les lots disponibles depuis debuttomo_finis (non clos).
 */
const getLotsFinTomoFinis = async (_req, res) => {
    try {
        const done = await prisma_1.default.fin_tomo_finis.findMany({
            select: { id_debuttomo: true },
        });
        const doneIds = done.map((d) => d.id_debuttomo);
        const lots = await prisma_1.default.debuttomo_finis.findMany({
            where: doneIds.length ? { id_debuttomo: { notIn: doneIds } } : {},
            select: {
                id_debuttomo: true,
                activite: true,
                produit_fini: true,
                nb_puces_tomo: true,
            },
            orderBy: { id_debuttomo: 'asc' },
        });
        res.json(lots);
    }
    catch (err) {
        console.error('Erreur getLotsFinTomoFinis:', err);
        res.status(500).json({ error: 'Erreur serveur', details: err?.message ?? String(err) });
    }
};
exports.getLotsFinTomoFinis = getLotsFinTomoFinis;
/**
 * GET /api/fin-tomo-finis/:id
 */
const getFinTomoFinisById = async (req, res) => {
    try {
        const id = s(req.params.id);
        if (!id) {
            res.status(400).json({ error: 'id manquant' });
            return;
        }
        const row = await prisma_1.default.fin_tomo_finis.findUnique({
            where: { id_debuttomo: id },
        });
        if (!row) {
            res.status(404).json({ error: 'Introuvable' });
            return;
        }
        res.json(row);
    }
    catch (err) {
        console.error('Erreur getFinTomoFinisById:', err);
        res.status(500).json({ error: 'Erreur serveur', details: err?.message ?? String(err) });
    }
};
exports.getFinTomoFinisById = getFinTomoFinisById;
