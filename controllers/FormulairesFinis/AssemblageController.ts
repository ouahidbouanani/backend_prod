import { Request, Response } from 'express';
// ============================================
// controllers/FormulairesFinis/AssemblageController.js
// ============================================
import prisma from '../../config/prisma';

export const getAvailableLotsForReference = async (req: Request, res: Response): Promise<void> => {
  try {
    const reference = req.query.reference;

    if (!reference || typeof reference !== 'string') {
      res.status(400).json({ error: 'Paramètre "reference" obligatoire' });
      return;
    }

    const lots = await prisma.lot_status.findMany({
      where: {
        type_piece: reference,            // ex: "N100"
        current_step: 'pret_assemblage',
        disponible_finis: true,
      },
      select: {
        id_lot: true                
      },
    });

    res.json(lots);
  } catch (err) {
    console.error('Erreur lors de la récupération des lots disponibles :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};