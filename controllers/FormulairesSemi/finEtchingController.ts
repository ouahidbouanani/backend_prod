import { Request, Response } from 'express';
// ============================================
// controllers/FormulairesSemi/finEtchingController.js
// ============================================
import prisma from '../../config/prisma';

export const getLots = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Récupérer tous les lots finis (à exclure)
    const lotsFinis = await prisma.fin_etching.findMany({
      select: { id_lot: true }
    });
    const idsFinis = lotsFinis.map(l => l.id_lot);

    // 2. Récupérer tous les lots ayant AU MOINS une prise_de_cotes
    const lotsAvecPrises = await prisma.prise_de_cotes.findMany({
      select: { id_lot: true },
      distinct: ['id_lot']   // évite les doublons
    });

    // 3. Filtrer côté JS les lots NON présents dans fin_etching
    const results = lotsAvecPrises
      .filter(lot => !idsFinis.includes(lot.id_lot));

    res.json(results);
  } catch (err: any) {
    console.error("Erreur lors de la récupération des lots:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getLotInfo = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const lotId = parseInt(req.params.lotId);

        const result = await prisma.debut_etching.findFirst({
            where: { id_lot: lotId },
            select: { num_lot_wafer: true, nb_passage: true },
            orderBy: { nb_passage: 'desc' }
        });

        if (!result) {
            return res.status(404).json({ error: 'Lot introuvable' });
        }

        res.json(result);
    } catch (err) {
        console.error('Erreur récupération lot:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const addFinEtching = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            id_lot, num_lot_wafer, nb_passage, date_fin,
            heure_fin, nb_piece_conforme, operateur, commentaire
        } = req.body;

        await prisma.$transaction(async (tx) => {
            await tx.fin_etching.create({
                data: {
                    id_lot, num_lot_wafer, nb_passage,
                    date_fin, heure_fin,
                    nb_piece_conforme, operateur, commentaire
                }
            });

            await tx.lot_status.upsert({
                where: { id_lot: id_lot },
                update: { current_step: 'fin_etching' },
                create: { id_lot: id_lot, current_step: 'fin_etching', type_piece: '', revision: '' }
            });
        });

        res.status(200).json({ message: 'Fin Etching enregistrée et statut mis à jour' });
    } catch (err) {
        console.error('Erreur ajout fin etching:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};