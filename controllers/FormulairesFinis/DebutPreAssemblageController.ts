import { Request, Response } from "express";
import prisma  from "../../config/prisma";

const s = (v: any) => (v === undefined || v === null ? "" : String(v).trim());

/**
 * GET /api/debutpreassemblage/lots-disponibles?reference=XXX
 * -> lots dispo depuis lot_status
 */
export const getAvailableLotsForReference = async (req: Request, res: Response): Promise<void> => {
  try {
    const reference = req.query.reference;

    if (!reference || typeof reference !== "string") {
      res.status(400).json({ error: 'Paramètre "reference" obligatoire' });
      return;
    }

    const lots = await prisma.lot_status.findMany({
      where: {
        type_piece: reference,
        current_step: "pret_assemblage",
        disponible_finis: true,
      },
      select: { id_lot: true },
      orderBy: { id_lot: "asc" },
    });

    res.json(lots);
  } catch (err) {
    console.error("Erreur getAvailableLotsForReference:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * GET /api/debutpreassemblage/pieces-disponibles?id_lot=2
 * -> nb_piece_conforme depuis fin_etching (id_lot unique)
 */
export const getPiecesDisponiblesByLot = async (req: Request, res: Response): Promise<void> => {
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

    const row = await prisma.fin_etching.findUnique({
      where: { id_lot: idLot },
      select: { nb_piece_conforme: true },
    });

    res.json({
      id_lot: idLot,
      nb_piece_disponible: row?.nb_piece_conforme ?? 0,
    });
  } catch (err) {
    console.error("Erreur getPiecesDisponiblesByLot:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * GET /api/debutpreassemblage/pieces-utilisees?produit_fini=SK&lot_corps=2
 * -> renvoie les pièces déjà déclarées pour (produit_fini, lot_corps)
 */
export const getPiecesUtiliseesByProduitLot = async (req: Request, res: Response): Promise<void> => {
  try {
    const produit_fini = typeof req.query.produit_fini === "string" ? req.query.produit_fini.trim() : "";
    const lot_corps_raw = req.query.lot_corps;

    if (!produit_fini) {
      res.status(400).json({ error: 'Paramètre "produit_fini" obligatoire' });
      return;
    }

    if (lot_corps_raw === undefined) {
      res.status(400).json({ error: 'Paramètre "lot_corps" obligatoire' });
      return;
    }

    const lot_corps = Number(lot_corps_raw);
    if (!Number.isFinite(lot_corps) || lot_corps <= 0) {
      res.status(400).json({ error: 'Paramètre "lot_corps" invalide' });
      return;
    }

    const rows = await prisma.debut_preassemblage_piece.findMany({
      where: {
        debut_preassemblage: {
          produit_fini,
          lot_corps,
        },
      },
      select: { piece_code: true },
    });

    res.json(rows.map((r) => r.piece_code));
  } catch (err: any) {
    console.error("Erreur getPiecesUtiliseesByProduitLot:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

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
export const createDebutPreassemblage = async (req: Request, res: Response): Promise<void> => {
  try {
    const activite = s(req.body.activite);
    const produit_fini = s(req.body.produit_fini);
    const lot_corps_raw = req.body.lot_corps;
    const dateStr = s(req.body.date);
    const operateur = s(req.body.operateur);

    const piece_disponible = Number(req.body.piece_disponible ?? 0);
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

    // references: [{reference_nom, lot_valeur}]
    const refsInput = Array.isArray(req.body.references) ? req.body.references : [];
    const seen = new Set<string>();

    const refsCreate = refsInput
      .map((r: any) => ({
        reference_nom: s(r.reference_nom ?? r.nom),
        lot_valeur: s(r.lot_valeur ?? (Array.isArray(r.valeurs) ? r.valeurs.filter(Boolean).join(",") : r.valeurs)),
      }))
      .filter((r: any) => r.reference_nom && r.lot_valeur)
      .filter((r: any) => {
        if (seen.has(r.reference_nom)) return false; // évite doublon payload
        seen.add(r.reference_nom);
        return true;
      });

    const piecesInput = Array.isArray(req.body.pieces) ? req.body.pieces : [];
    const piecesCreate = piecesInput
      .map((p: any) => s(p))
      .filter(Boolean)
      .map((piece_code: string) => ({ piece_code }));

    // (optionnel) cohérence : quantite_utilisee = nb pièces cochées
    const quantiteFinale = piecesCreate.length;

    // ✅ ID auto: PSM-${produit_fini}-${numero_incr}
    const prefix = `PSM-${produit_fini}-`;
    const parseSuffixNumber = (id: string): number | null => {
      if (!id || !id.startsWith(prefix)) return null;
      const suffix = id.slice(prefix.length);
      const n = Number(String(suffix).trim());
      return Number.isFinite(n) && n > 0 ? n : null;
    };

    const formatId = (n: number) => {
      const numPart = n < 10 ? String(n).padStart(2, "0") : String(n);
      return `${prefix}${numPart}`;
    };

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const ids = await prisma.debut_preassemblage.findMany({
        where: {
          produit_fini,
          id_debutpreassemblage: { startsWith: prefix },
        },
        select: { id_debutpreassemblage: true },
      });

      const maxNum = ids
        .map((r) => parseSuffixNumber(r.id_debutpreassemblage))
        .filter((n): n is number => n !== null)
        .reduce((acc, n) => (n > acc ? n : acc), 0);

      const id_debutpreassemblage = formatId(maxNum + 1);

      try {
        const created = await prisma.debut_preassemblage.create({
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
        return;
      } catch (err: any) {
        if (err?.code === "P2002") {
          continue;
        }
        throw err;
      }
    }

    res.status(409).json({ error: "Impossible de générer un ID unique (réessayez)" });
  } catch (err: any) {
    console.error("Erreur createDebutPreassemblage:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * GET /api/debutpreassemblage
 * -> liste pour select étape suivante
 */
export const listDebutPreassemblage = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await prisma.debut_preassemblage.findMany({
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
  } catch (err) {
    console.error("Erreur listDebutPreassemblage:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * GET /api/debutpreassemblage/:id
 * -> récupérer tout (main + refs + pièces)
 */
export const getDebutPreassemblageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = s(req.params.id);

    const row = await prisma.debut_preassemblage.findUnique({
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
  } catch (err: any) {
    console.error("Erreur getDebutPreassemblageById:", err);
    res.status(500).json({
      error: "Erreur serveur",
      details: err?.message ?? String(err),
    });
  }
};

// GET /api/debutpreassemblage/listeIds?activite=...&produit_fini=...

export const listDebutPreassemblageIds = async (req: Request, res: Response): Promise<void> => {
  try {
    const activite = typeof req.query.activite === "string" ? req.query.activite.trim() : "";
    const produit_fini = typeof req.query.produit_fini === "string" ? req.query.produit_fini.trim() : "";

    const where: any = {};
    if (activite) where.activite = activite;
    if (produit_fini) where.produit_fini = produit_fini;

    const rows = await prisma.debut_preassemblage.findMany({
      orderBy: { created_at: "desc" },
      where,
      select: { id_debutpreassemblage: true },
    });

    res.json(rows.map((r) => r.id_debutpreassemblage));
  } catch (err: any) {
    console.error("Erreur listDebutPreassemblageIds:", err);
    res.status(500).json({ error: "Erreur serveur", details: err?.message ?? String(err) });
  }
};
