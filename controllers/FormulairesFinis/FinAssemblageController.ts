import { Request, Response } from "express";
import prisma from "../../config/prisma";

/**
 * POST /api/finassemblage
 * body:
 * {
 *   id_finassemblage: "ASM-SK-2",
 *   date: "2026-01-20",
 *   operateur: "OBO",
 *   commentaire: null,
 *   pieces: [{ piece_code:"CSK-002-02", qc_ok:true }, ...]
 * }
 */
export const createFinAssemblage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_finassemblage, date, operateur, commentaire, pieces } = req.body;
    const finId = id_finassemblage;

    if (!finId || !date || !operateur) {
      res.status(400).json({
        error: "Champs obligatoires: id_finassemblage, date, operateur",
      });
      return;
    }

    const debut = await prisma.debut_assemblage.findUnique({
      where: { id_debutassemblage: finId },
      select: { id_debutassemblage: true },
    });

    if (!debut) {
      res.status(404).json({ error: "Début assemblage introuvable" });
      return;
    }

    const already = await prisma.fin_assemblage.findUnique({
      where: { id_finassemblage: finId },
      select: { id_finassemblage: true },
    });

    if (already) {
      res.status(409).json({ error: "Fin assemblage existe déjà pour ce dossier" });
      return;
    }

    const allowed = await prisma.debut_assemblage_piece.findMany({
      where: { id_debutassemblage: finId },
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

    const created = await prisma.$transaction(async (tx) => {
      const header = await tx.fin_assemblage.create({
        data: {
          id_finassemblage: finId,
          date: new Date(date),
          operateur,
          commentaire: commentaire ?? null,
        },
        select: {
          id_finassemblage: true,
          date: true,
          operateur: true,
          commentaire: true,
        },
      });

      if (cleanedPieces.length > 0) {
        await tx.fin_assemblage_piece.createMany({
          data: cleanedPieces.map((p: any) => ({
            id_finassemblage: finId,
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
    console.error("Erreur createFinAssemblage:", err);
    res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
  }
};

/**
 * GET /api/finassemblage/:id
 */
export const getFinAssemblageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;

    const row = await prisma.fin_assemblage.findUnique({
      where: { id_finassemblage: id },
      select: {
        id_finassemblage: true,
        date: true,
        operateur: true,
        commentaire: true,
        pieces: { select: { piece_code: true, qc_ok: true } },
      },
    });

    if (!row) {
      res.status(404).json({ error: "Introuvable" });
      return;
    }

    res.json(row);
  } catch (err: any) {
    console.error("Erreur getFinAssemblageById:", err);
    res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
  }
};

/**
 * GET /api/finassemblage/ids
 */
export const getFinAssemblageIds = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Exclure les dossiers déjà déclarés dans `debuttomo_finis`
    // (donc non disponibles pour une nouvelle déclaration).
    const alreadyDeclared = await prisma.debuttomo_finis.findMany({
      select: { id_debuttomo: true },
    });
    const declaredIds = alreadyDeclared.map((r) => r.id_debuttomo);

    const ids = await prisma.fin_assemblage.findMany({
      where: declaredIds.length ? { id_finassemblage: { notIn: declaredIds } } : undefined,
      select: { id_finassemblage: true },
    });

    res.json(ids.map((item) => item.id_finassemblage));
  } catch (err: any) {
    console.error("Erreur getFinAssemblageIds:", err);
    res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
  }
};
