"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDebutTomoFinisById = exports.createDebutTomoFinis = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const s = (v) => (typeof v === "string" ? v.trim() : "");
/**
 * POST /api/debut-tomo-finis
 * body:
 * {
 *   id_debuttomo: "ASM-SK-2",
 *   nb_pieces: 3,
 *   etage: 1,
 *   date: "2026-01-20",
 *   heure_debut: "08:30",
 *   operateur: "OBO",
 *   num_machine: "21-000099",
 *   version: "V2025",
 *   separation: "Manuel",
 *   commentaire: ""
 * }
 */
const createDebutTomoFinis = async (req, res) => {
    try {
        const id_debuttomo = s(req.body.id_debuttomo);
        const activite = s(req.body.activite);
        const produit_fini = s(req.body.produit_fini);
        const nb_puces_tomo = Number(req.body.nb_puces_tomo);
        const etage = Number(req.body.etage);
        const date = s(req.body.date);
        const heure_debut = s(req.body.heure_debut);
        const operateur = s(req.body.operateur);
        const num_machine = s(req.body.num_machine);
        const version = s(req.body.version);
        const separation = s(req.body.separation);
        const commentaire = s(req.body.commentaire);
        if (!id_debuttomo || !activite || !produit_fini || !nb_puces_tomo || !etage || !date || !heure_debut || !operateur || !num_machine || !version || !separation) {
            res.status(400).json({ error: "Champs obligatoires manquants" });
            return;
        }
        const finExists = await prisma_1.default.fin_assemblage.findUnique({
            where: { id_finassemblage: id_debuttomo },
            select: { id_finassemblage: true },
        });
        if (!finExists) {
            res.status(404).json({ error: "Fin assemblage introuvable" });
            return;
        }
        const already = await prisma_1.default.debuttomo_finis.findUnique({
            where: { id_debuttomo },
            select: { id_debuttomo: true },
        });
        if (already) {
            res.status(409).json({ error: "Début tomo existe déjà pour ce lot" });
            return;
        }
        const nbDisponibles = await prisma_1.default.fin_assemblage_piece.count({
            where: { id_finassemblage: id_debuttomo },
        });
        if (nb_puces_tomo > nbDisponibles) {
            res.status(400).json({ error: "Nombre de puces supérieur au disponible" });
            return;
        }
        const created = await prisma_1.default.debuttomo_finis.create({
            data: {
                id_debuttomo,
                activite,
                produit_fini,
                nb_puces_disponibles: nbDisponibles,
                nb_puces_tomo,
                etage,
                date: new Date(date),
                heure_debut: new Date(`1970-01-01T${heure_debut}`),
                operateur,
                num_machine,
                version,
                separation,
                commentaire: commentaire || null,
            },
            select: { id_debuttomo: true },
        });
        res.status(201).json(created);
    }
    catch (err) {
        console.error("Erreur createDebutTomoFinis:", err);
        res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
    }
};
exports.createDebutTomoFinis = createDebutTomoFinis;
/**
 * GET /api/debut-tomo-finis/:id
 */
const getDebutTomoFinisById = async (req, res) => {
    try {
        const id = s(req.params.id);
        if (!id) {
            res.status(400).json({ error: "id manquant" });
            return;
        }
        const row = await prisma_1.default.debuttomo_finis.findUnique({
            where: { id_debuttomo: id },
        });
        if (!row) {
            res.status(404).json({ error: "Introuvable" });
            return;
        }
        res.json(row);
    }
    catch (err) {
        console.error("Erreur getDebutTomoFinisById:", err);
        res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
    }
};
exports.getDebutTomoFinisById = getDebutTomoFinisById;
