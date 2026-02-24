import { Request, Response } from "express";
import prisma from "../../config/prisma";

const s = (v: any) => (typeof v === "string" ? v.trim() : "");

/**
 * GET /api/debut-hydro-finis/lots?activite=PROD&produit_fini=SK
 * Lots disponibles: issus de fin_tomo_finis et non encore déclarés dans debuthydro_finis.
 */
export const getLotsDebutHydroFinis = async (req: Request, res: Response): Promise<void> => {
	try {
		const activite = s(req.query.activite);
		const produit_fini = s(req.query.produit_fini);

		const already = await prisma.debuthydro_finis.findMany({
			select: { id_debuthydro: true },
		});
		const alreadyIds = already.map((r) => r.id_debuthydro);

		const where: any = {};
		if (alreadyIds.length) where.id_debuttomo = { notIn: alreadyIds };
		if (activite) where.activite = activite;
		if (produit_fini) where.produit_fini = produit_fini;

		const lots = await prisma.fin_tomo_finis.findMany({
			where,
			select: {
				id_debuttomo: true,
				activite: true,
				produit_fini: true,
				nb_puces_tomo: true,
			},
			orderBy: { id_debuttomo: "asc" },
		});

		res.json(lots);
	} catch (err: any) {
		console.error("Erreur getLotsDebutHydroFinis:", err);
		res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
	}
};

/**
 * GET /api/debut-hydro-finis/pieces?id_debuthydro=ASM-SK-2
 * Pièces dispo: issues de fin_assemblage_piece pour l'id sélectionné.
 */
export const getPiecesDisponiblesForHydroLot = async (req: Request, res: Response): Promise<void> => {
	try {
		const id_debuthydro = s(req.query.id_debuthydro);
		if (!id_debuthydro) {
			res.status(400).json({ error: 'Paramètre "id_debuthydro" obligatoire' });
			return;
		}

		const pieces = await prisma.fin_assemblage_piece.findMany({
			where: { id_finassemblage: id_debuthydro },
			select: { piece_code: true },
			orderBy: { piece_code: "asc" },
		});

		res.json({
			id_debuthydro,
			piece_disponible: pieces.length,
			pieces,
		});
	} catch (err: any) {
		console.error("Erreur getPiecesDisponiblesForHydroLot:", err);
		res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
	}
};

/**
 * POST /api/debut-hydro-finis
 * body:
 * {
 *   id_debuthydro: "ASM-SK-2" (lot issu de fin_tomo_finis),
 *   activite: "PROD",
 *   produit_fini: "SK",
 *   date: "2026-01-20",
 *   operateur: "OBO",
 *   commentaire: "",
 *   pieces: ["CSK-002-01", ...]
 * }
 */
export const createDebutHydroFinis = async (req: Request, res: Response): Promise<void> => {
	try {
		const id_debuthydro = s(req.body.id_debuthydro);
		const activite = s(req.body.activite);
		const produit_fini = s(req.body.produit_fini);
		const date = s(req.body.date);
		const operateur = s(req.body.operateur);
		const commentaire = s(req.body.commentaire);

		if (!id_debuthydro || !activite || !produit_fini || !date || !operateur) {
			res.status(400).json({ error: "Champs obligatoires manquants" });
			return;
		}

		// Vérifier étape précédente: fin_tomo_finis doit exister
		const prev = await prisma.fin_tomo_finis.findUnique({
			where: { id_debuttomo: id_debuthydro },
			select: { id_debuttomo: true, activite: true, produit_fini: true },
		});
		if (!prev) {
			res.status(404).json({ error: "Lot introuvable dans fin_tomo_finis" });
			return;
		}

		if (prev.activite !== activite || prev.produit_fini !== produit_fini) {
			res.status(400).json({
				error: "Activité / produit fini ne correspondent pas au lot sélectionné",
				expected: { activite: prev.activite, produit_fini: prev.produit_fini },
			});
			return;
		}

		// Empêcher double création
		const already = await prisma.debuthydro_finis.findUnique({
			where: { id_debuthydro },
			select: { id_debuthydro: true },
		});
		if (already) {
			res.status(409).json({ error: "Début hydro existe déjà pour ce lot" });
			return;
		}

		// Pièces autorisées = celles de fin_assemblage_piece (sécurité)
		const allowed = await prisma.fin_assemblage_piece.findMany({
			where: { id_finassemblage: id_debuthydro },
			select: { piece_code: true },
		});
		const allowedSet = new Set(allowed.map((p) => p.piece_code));

		const piecesInput = Array.isArray(req.body.pieces) ? req.body.pieces : [];
		const cleanedPieceCodes = Array.from(
			new Set(
				piecesInput
					.map((p: any) => s(p))
					.filter((code: string) => code && allowedSet.has(code))
			)
		);

		const piece_disponible = allowed.length;
		const quantite_utilisee = cleanedPieceCodes.length;

		const created = await prisma.$transaction(async (tx) => {
			const header = await tx.debuthydro_finis.create({
				data: {
					id_debuthydro,
					activite,
					produit_fini,
					piece_disponible,
					quantite_utilisee,
					date: new Date(date),
					operateur,
					commentaire: commentaire || null,
				},
				select: { id_debuthydro: true },
			});

			if (cleanedPieceCodes.length) {
				await tx.debuthydro_finis_piece.createMany({
					data: cleanedPieceCodes.map((piece_code: string) => ({
						id_debuthydro,
						piece_code,
					})),
				});
			}

			return header;
		});

		res.status(201).json(created);
	} catch (err: any) {
		console.error("Erreur createDebutHydroFinis:", err);
		res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
	}
};

/**
 * GET /api/debut-hydro-finis/:id
 */
export const getDebutHydroFinisById = async (req: Request, res: Response): Promise<void> => {
	try {
		const id = s(req.params.id);
		if (!id) {
			res.status(400).json({ error: "id manquant" });
			return;
		}

		const row = await prisma.debuthydro_finis.findUnique({
			where: { id_debuthydro: id },
			select: {
				id_debuthydro: true,
				activite: true,
				produit_fini: true,
				piece_disponible: true,
				quantite_utilisee: true,
				date: true,
				operateur: true,
				commentaire: true,
				pieces: { select: { piece_code: true }, orderBy: { piece_code: "asc" } },
			},
		});

		if (!row) {
			res.status(404).json({ error: "Introuvable" });
			return;
		}

		res.json(row);
	} catch (err: any) {
		console.error("Erreur getDebutHydroFinisById:", err);
		res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
	}
};
