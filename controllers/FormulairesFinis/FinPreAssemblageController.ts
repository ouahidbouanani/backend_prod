import { Request, Response } from "express";
import prisma  from "../../config/prisma";


/**
 * POST /api/finpreassemblage  (CREATE ONLY)
 * body:
 * {
 *   id_debutpreassemblage: "ASM-SK-2",
 *   date: "2026-01-20",
 *   operateur: "OBO",
 *   commentaire: null,
 *   pieces: [{ piece_code:"CSK-002-02", qc_ok:true }, ...]
 * }
 */
export const createFinPreassemblage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { activite, produit_fini ,id_debutpreassemblage, date, operateur, commentaire, pieces } = req.body;

    // validations minimales
    if (!id_debutpreassemblage || !date || !operateur) {
      res.status(400).json({
        error: "Champs obligatoires: id_debutpreassemblage, date, operateur",
      });
      return;
    }

    // 1) vérifier que le dossier DEBUT existe
    const debut = await prisma.debut_preassemblage.findUnique({
      where: { id_debutpreassemblage },
      select: { id_debutpreassemblage: true },
    });

    if (!debut) {
      res.status(404).json({ error: "Début pré-assemblage introuvable" });
      return;
    }

    // 2) empêcher double création FIN
    const already = await prisma.fin_preassemblage.findUnique({
      where: { id_debutpreassemblage },
      select: { id_debutpreassemblage: true },
    });

    if (already) {
      res.status(409).json({
        error: "Fin pré-assemblage existe déjà pour ce dossier",
      });
      return;
    }

    // 3) Pièces autorisées = celles choisies dans le début (sécurité)
    const allowed = await prisma.debut_preassemblage_piece.findMany({
      where: { id_debutpreassemblage },
      select: { piece_code: true },
    });
    const allowedSet = new Set(allowed.map((p) => p.piece_code));

    const cleanedPieces = Array.isArray(pieces)
      ? pieces
          .map((p: any) => ({
            piece_code: p.piece_code,
            qc_ok: !!p.qc_ok,
          }))
          .filter((p: any) => p.piece_code && allowedSet.has(p.piece_code))
      : [];

    // 4) CREATE dans une transaction (header + lignes QC)
    const created = await prisma.$transaction(async (tx) => {
      const header = await tx.fin_preassemblage.create({
        data: {
          id_debutpreassemblage,
          activite: activite,
          produit_fini: produit_fini,
          date: new Date(date),
          operateur,
          commentaire: commentaire ?? null,
        },
        select: {
          id_debutpreassemblage: true,
          date: true,
          operateur: true,
          commentaire: true,
        },
      });

      if (cleanedPieces.length > 0) {
        await tx.fin_preassemblage_piece.createMany({
          data: cleanedPieces.map((p: any) => ({
            id_debutpreassemblage,
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
  } catch (err: any) {
    console.error("Erreur createFinPreassemblage:", err);
    res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
  }
};

/**
 * GET /api/finpreassemblage/:id
 * -> pour afficher / pré-remplir si besoin
 */
export const getFinPreassemblageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;

    const row = await prisma.fin_preassemblage.findUnique({
      where: { id_debutpreassemblage: id },
      select: {
        id_debutpreassemblage: true,
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
  } catch (err: any) {
    console.error("Erreur getFinPreassemblageById:", err);
    res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
  }
};


// GET /api/finpreassemblage/ids
export const getFinPreassemblageIds = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const ids = await prisma.fin_preassemblage.findMany({
      select: {
        id_debutpreassemblage: true,
      },
    });

    // Optionnel : retourner juste un tableau de strings
    const result = ids.map(item => item.id_debutpreassemblage);

    res.json(result);
  } catch (err: any) {
    console.error("Erreur getFinPreassemblageIds:", err);
    res.status(500).json({
      error: "Erreur serveur",
      details: err?.message ?? String(err),
    });
  }
};
