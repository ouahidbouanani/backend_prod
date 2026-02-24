import { Request, Response } from 'express';
// ============================================
// controllers/FormulairesSemi/finTomoController.js
// ============================================
import prisma from '../../config/prisma';

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
    const { id_lot, activity, type_pieces, quantite, date, heure, operateur } = req.body;

    const idLotNumber = Number(id_lot);
    if (!idLotNumber || Number.isNaN(idLotNumber)) {
      res.status(400).json({ message: 'id_lot invalide.' });
      return;
    }

    const debut = await prisma.debut_tomo.findUnique({
      where: { id_lot: idLotNumber },
      select: { nb_pieces: true },
    });
    if (!debut) {
      res.status(400).json({ message: 'Lot introuvable dans debut_tomo (début tomographie requis).' });
      return;
    }

        await prisma.$transaction(async (tx) => {
            await tx.fin_tomo.create({
                data: {
                    id_lot: idLotNumber,
                    quantite: debut.nb_pieces ?? Number(quantite) ?? 0,
                    date: new Date(date),
                    heure: new Date(`1970-01-01T${heure}`),
                    operateur
                }
            });

      // Compat Prisma Client: set new columns via SQL UPDATE
      if (activity || type_pieces) {
        await tx.$executeRaw`
          UPDATE fin_tomo
          SET activity = ${activity ?? null}, type_pieces = ${type_pieces ?? null}
          WHERE id_lot = ${idLotNumber}
        `;
      }

            await tx.lot_status.update({
                where: { id_lot: id_lot },
                data: { current_step: 'pret_assemblage', disponible_finis: true}
            });
        });

        res.status(201).json({ message: '✅ Données enregistrées avec succès.' });
    } catch (err) {
        console.error('Erreur insertion fin_tomo :', err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'insertion fin_tomo' });
    }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
    try {
        const results = await prisma.fin_tomo.findMany();
        res.json(results);
    } catch (err) {
        console.error('Erreur récupération :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await prisma.$queryRaw<Array<{ activity: string | null }>>`
      SELECT DISTINCT COALESCE(dt.activity, fe.activity, ls.activity) AS activity
      FROM debut_tomo dt
      LEFT JOIN fin_tomo ft ON ft.id_lot = dt.id_lot
      INNER JOIN lot_status ls ON ls.id_lot = dt.id_lot
      LEFT JOIN fin_etching fe ON fe.id_lot = dt.id_lot
      WHERE ft.id_lot IS NULL
        AND ls.disponible_finis = false
        AND ls.current_step = 'fin_tomo'
        AND ls.type_piece NOT LIKE 'N%'
        AND COALESCE(dt.activity, fe.activity, ls.activity) IS NOT NULL
      ORDER BY activity ASC
    `;

    res.json(rows.map(r => r.activity).filter(Boolean));
  } catch (err) {
    console.error('Erreur lors de la récupération des activités:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getTypePiecesOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const activity = String(req.query.activity || '').trim();
    if (!activity) {
      res.status(400).json({ message: 'Le paramètre "activity" est requis.' });
      return;
    }

    const rows = await prisma.$queryRaw<Array<{ type_pieces: string | null }>>`
      SELECT DISTINCT COALESCE(dt.type_pieces, fe.type_pieces, ls.type_piece) AS type_pieces
      FROM debut_tomo dt
      LEFT JOIN fin_tomo ft ON ft.id_lot = dt.id_lot
      INNER JOIN lot_status ls ON ls.id_lot = dt.id_lot
      LEFT JOIN fin_etching fe ON fe.id_lot = dt.id_lot
      WHERE ft.id_lot IS NULL
        AND ls.disponible_finis = false
        AND ls.current_step = 'fin_tomo'
        AND ls.type_piece NOT LIKE 'N%'
        AND COALESCE(dt.activity, fe.activity, ls.activity) = ${activity}
        AND COALESCE(dt.type_pieces, fe.type_pieces, ls.type_piece) IS NOT NULL
      ORDER BY type_pieces ASC
    `;

    res.json(rows.map(r => r.type_pieces).filter(Boolean));
  } catch (err) {
    console.error('Erreur lors de la récupération des types de pièces:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getLots = async (req: Request, res: Response): Promise<void> => {
  try {
    const activity = String(req.query.activity || '').trim();
    const typePieces = String(req.query.type_pieces || '').trim();

    if (!activity || !typePieces) {
      res.status(400).json({ message: 'Les paramètres "activity" et "type_pieces" sont requis.' });
      return;
    }

    const results = await prisma.$queryRaw<Array<{ id_lot: number; nb_pieces: number | null }>>`
      SELECT DISTINCT dt.id_lot, dt.nb_pieces
      FROM debut_tomo dt
      LEFT JOIN fin_tomo ft ON ft.id_lot = dt.id_lot
      INNER JOIN lot_status ls ON ls.id_lot = dt.id_lot
      LEFT JOIN fin_etching fe ON fe.id_lot = dt.id_lot
      WHERE ft.id_lot IS NULL
        AND ls.disponible_finis = false
        AND ls.current_step = 'fin_tomo'
        AND ls.type_piece NOT LIKE 'N%'
        AND COALESCE(dt.activity, fe.activity, ls.activity) = ${activity}
        AND COALESCE(dt.type_pieces, fe.type_pieces, ls.type_piece) = ${typePieces}
      ORDER BY dt.id_lot DESC
    `;

    res.json(results);

  } catch (err) {
    console.error("Erreur lors de la récupération des lots:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
