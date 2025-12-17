import { Request, Response } from 'express';
// ============================================
// controllers/FormulairesSemi/finTomoController.js
// ============================================
import prisma from '../../config/prisma';

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_lot, quantite, date, heure, operateur } = req.body;

        await prisma.$transaction(async (tx) => {
            await tx.fin_tomo.create({
                data: {
                    id_lot,
                    quantite,
                    date: new Date(date),
                    heure: new Date(`1970-01-01T${heure}`),
                    operateur
                }
            });

            await tx.lot_status.update({
                where: { id_lot: id_lot },
                data: { current_step: 'pret_assemblage', disponible_finis: true}
            });
        });

        res.status(201).json({ message: 'Fin de tomographie enregistrée et statut mis à jour' });
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

export const getLots = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Récupérer les id_lot de fin_tomo (à exclure)
    const lotsFinTomo = await prisma.fin_tomo.findMany({
      select: { id_lot: true }
    });

    // Convertir en number[] (très important !)
    const idsFinTomo = lotsFinTomo
      .map(l => Number(l.id_lot))
      .filter(n => !isNaN(n));

    // 2. Récupérer les lots dans debut_tomo qui ne sont pas dans fin_tomo
    const results = await prisma.debut_tomo.findMany({
      where: {
        id_lot: {
          notIn: idsFinTomo   // exclure fin_tomo
        }
      },
      select: { id_lot: true }
    });

    res.json(results);

  } catch (err) {
    console.error("Erreur lors de la récupération des lots:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
