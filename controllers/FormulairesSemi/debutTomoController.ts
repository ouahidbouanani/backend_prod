import { Request, Response } from 'express';
// ============================================
// controllers/FormulairesSemi/debutTomoController.js
// ============================================
import prisma from '../../config/prisma';

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
      activity, type_pieces,
            id_lot, nb_pieces, etage, date, heure_debut, operateur,
            num_machine, version, separation, commentaire
        } = req.body;

        await prisma.$transaction(async (tx) => {
            await tx.debut_tomo.create({
                data: {
                    id_lot: id_lot,
                    nb_pieces, etage,
                    date: new Date(date),
                    heure_debut: new Date(`1970-01-01T${heure_debut}`),
                    operateur, num_machine, version, separation, commentaire
                }
            });

      // Compat Prisma Client: set new columns via SQL UPDATE
      if (activity || type_pieces) {
        await tx.$executeRaw`
          UPDATE debut_tomo
          SET activity = ${activity ?? null}, type_pieces = ${type_pieces ?? null}
          WHERE id_lot = ${Number(id_lot)}
        `;
      }

            await tx.lot_status.update({
                where: { id_lot },
                data: { current_step: 'fin_tomo' },
            });
        });

        res.status(201).json({ message: '✅ Données enregistrées avec succès.' });
    } catch (err) {
        console.error('Erreur d\'insertion :', err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement' });
    }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
    try {
        const rows = await prisma.debut_tomo.findMany();
        res.json(rows);
    } catch (err) {
        console.error('Erreur de récupération :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};


export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await prisma.$queryRaw<Array<{ activity: string | null }>>`
      SELECT DISTINCT COALESCE(fe.activity, ls.activity) AS activity
      FROM fin_etching fe
      INNER JOIN lot_status ls ON ls.id_lot = fe.id_lot
      LEFT JOIN debut_tomo dt ON dt.id_lot = fe.id_lot
      WHERE dt.id_lot IS NULL
        AND ls.disponible_finis = false
        AND ls.type_piece NOT LIKE 'N%'
        AND COALESCE(fe.activity, ls.activity) IS NOT NULL
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
      SELECT DISTINCT COALESCE(fe.type_pieces, ls.type_piece) AS type_pieces
      FROM fin_etching fe
      INNER JOIN lot_status ls ON ls.id_lot = fe.id_lot
      LEFT JOIN debut_tomo dt ON dt.id_lot = fe.id_lot
      WHERE dt.id_lot IS NULL
        AND ls.disponible_finis = false
        AND ls.type_piece NOT LIKE 'N%'
        AND COALESCE(fe.activity, ls.activity) = ${activity}
        AND COALESCE(fe.type_pieces, ls.type_piece) IS NOT NULL
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

    const results = await prisma.$queryRaw<Array<{ id_lot: number }>>`
      SELECT DISTINCT fe.id_lot
      FROM fin_etching fe
      INNER JOIN lot_status ls ON ls.id_lot = fe.id_lot
      LEFT JOIN debut_tomo dt ON dt.id_lot = fe.id_lot
      WHERE dt.id_lot IS NULL
        AND ls.disponible_finis = false
        AND ls.type_piece NOT LIKE 'N%'
        AND COALESCE(fe.activity, ls.activity) = ${activity}
        AND COALESCE(fe.type_pieces, ls.type_piece) = ${typePieces}
      ORDER BY fe.id_lot DESC
    `;

    res.json(results);
  } catch (err) {
    console.error('Erreur lors de la récupération des lots:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};


