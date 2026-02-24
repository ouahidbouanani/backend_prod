import { Request, Response } from "express";
import prisma from "../../config/prisma";

const s = (v: any) => (typeof v === "string" ? v.trim() : "");

/**
 * GET /api/fin-hydro-finis/lots
 * Lots disponibles: debuthydro_finis qui n'ont pas encore de fin_hydro_finis.
 */
export const getLotsFinHydroFinis = async (_req: Request, res: Response): Promise<void> => {
	try {
		const done = await prisma.fin_hydro_finis.findMany({
			select: { id_finhydro: true },
		});
		const doneIds = done.map((d) => d.id_finhydro);

		const lots = await prisma.debuthydro_finis.findMany({
			where: doneIds.length ? { id_debuthydro: { notIn: doneIds } } : {},
			select: {
				id_debuthydro: true,
				activite: true,
				produit_fini: true,
				quantite_utilisee: true,
			},
			orderBy: { id_debuthydro: "asc" },
		});

		res.json(lots);
	} catch (err: any) {
		console.error("Erreur getLotsFinHydroFinis:", err);
		res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
	}
};

/**
 * POST /api/fin-hydro-finis
 * body:
 * {
 *   id_debuthydro: "ASM-SK-2",
 *   date: "2026-01-21",
 *   operateur: "OBO",
 *   commentaire: ""
 * }
 */
export const createFinHydroFinis = async (req: Request, res: Response): Promise<void> => {
	try {
		const id_debuthydro = s(req.body.id_debuthydro);
		const date = s(req.body.date);
		const operateur = s(req.body.operateur);
		const commentaire = s(req.body.commentaire);

		if (!id_debuthydro || !date || !operateur) {
			res.status(400).json({ error: "Champs obligatoires manquants" });
			return;
		}

		const debut = await prisma.debuthydro_finis.findUnique({
			where: { id_debuthydro },
			select: {
				id_debuthydro: true,
				activite: true,
				produit_fini: true,
				quantite_utilisee: true,
			},
		});

		if (!debut) {
			res.status(404).json({ error: "Début hydro introuvable" });
			return;
		}

		const already = await prisma.fin_hydro_finis.findUnique({
			where: { id_finhydro: id_debuthydro },
			select: { id_finhydro: true },
		});
		if (already) {
			res.status(409).json({ error: "Fin hydro existe déjà pour ce lot" });
			return;
		}

		const created = await prisma.fin_hydro_finis.create({
			data: {
				id_finhydro: id_debuthydro,
				activite: debut.activite,
				produit_fini: debut.produit_fini,
				quantite_utilisee: debut.quantite_utilisee,
				date: new Date(date),
				operateur,
				commentaire: commentaire || null,
			},
			select: { id_finhydro: true },
		});

		res.status(201).json(created);
	} catch (err: any) {
		console.error("Erreur createFinHydroFinis:", err);
		res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
	}
};

/**
 * GET /api/fin-hydro-finis/:id
 */
export const getFinHydroFinisById = async (req: Request, res: Response): Promise<void> => {
	try {
		const id = s(req.params.id);
		if (!id) {
			res.status(400).json({ error: "id manquant" });
			return;
		}

		const row = await prisma.fin_hydro_finis.findUnique({
			where: { id_finhydro: id },
			select: {
				id_finhydro: true,
				activite: true,
				produit_fini: true,
				quantite_utilisee: true,
				date: true,
				operateur: true,
				commentaire: true,
			},
		});

		if (!row) {
			res.status(404).json({ error: "Introuvable" });
			return;
		}

		res.json(row);
	} catch (err: any) {
		console.error("Erreur getFinHydroFinisById:", err);
		res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
	}
};
