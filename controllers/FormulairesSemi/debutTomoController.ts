import { Request, Response } from 'express';
// ============================================
// controllers/FormulairesSemi/debutTomoController.js
// ============================================
import prisma from '../../config/prisma';

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
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

            await tx.lot_status.update({
                where: { id_lot },
                data: { current_step: 'fin_tomo' },
            });
        });

        res.status(201).json({ message: 'Début de tomographie enregistré et statut mis à jour' });
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


export const getLots = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Récupérer les lots déjà présents dans debut_tomo 
    const lotsTomo = await prisma.debut_tomo.findMany({
      select: { id_lot: true },
    });

    const idsTomo = lotsTomo
      .map(l => Number(l.id_lot))
      .filter(n => !isNaN(n));

    // 2. Récupérer les id_lot dans lot_status :
    //    - disponible_finis = true
    //    - type_piece ne commence PAS par "N" (pas des nozzles)
    const lotsStatus = await prisma.lot_status.findMany({
      where: {
        disponible_finis: false,
        NOT: {
          type_piece: {
            startsWith: 'N',
          },
        },
      },
      select: { id_lot: true },
    });

    const idsFromStatus = lotsStatus
      .map(l => Number(l.id_lot))
      .filter(n => !isNaN(n));

    // 3. Récupérer les lots fin_etching :
    //    - id_lot pas dans debut_tomo
    //    - id_lot présent dans les ids filtrés de lot_status
    const results = await prisma.fin_etching.findMany({
      where: {
        id_lot: {
          notIn: idsTomo,
          in: idsFromStatus,
        },
      },
      select: { id_lot: true },
    });

    res.json(results);
  } catch (err) {
    console.error('Erreur lors de la récupération des lots:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};


