import { Request, Response } from 'express';
// ============================================
// controllers/FormulairesSemi/debutEtchingController.js
// ============================================
import prisma from '../../config/prisma';

export const getLots = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Récupérer tous les id_lot présents dans fin_etching
    const etchingLots = await prisma.fin_etching.findMany({
      select: { id_lot: true }
    });

    // 2. Extraire les id dans un tableau
    const idsEtching = etchingLots.map(item => item.id_lot);

    // 3. Récupérer les lots dans fin_impression dont id_lot n'est PAS dans fin_etching
    const results = await prisma.fin_impression.findMany({
      where: {
        id_lot: {
          notIn: idsEtching   // exclure les lots déjà dans fin_etching
        }
      },
      select: {
        id_lot: true,
        num_lot_wafer: true,
        nb_imprimees: true
      }
    });

    // `fin_impression` ne contient pas `type_pieces` dans le schéma Prisma.
    // On le récupère depuis `lot_status.type_piece` et on renvoie la clé attendue `type_pieces`.
    const lotIds = results.map(item => item.id_lot);
    const lotStatuses = await prisma.lot_status.findMany({
      where: { id_lot: { in: lotIds } },
      select: { id_lot: true, type_piece: true }
    });

    const typeByLotId = new Map(lotStatuses.map(ls => [ls.id_lot, ls.type_piece] as const));
    const enriched = results.map(r => ({
      ...r,
      type_pieces: typeByLotId.get(r.id_lot) ?? null
    }));

    res.status(200).json(enriched);

  } catch (err) {
    console.error('Erreur lors de la récupération des lots:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


export const addDebutEtching = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      numeroLot, num_lot_wafer, nb_pieces, type_pieces, operateur, nb_passage,
      date_debut, heure_debut, temps_reel, koh, bain, position, commentaire
    } = req.body;

    await prisma.$transaction(async (tx) => {
      await tx.debut_etching.create({
        data: {
          id_lot: numeroLot,
          num_lot_wafer,
          nb_pieces,
          operateur,
          nb_passage,
          date_debut,      
          heure_debut,     
          temps_reel,
          koh,
          bain,
          position,
          commentaire
        }
      });

      await tx.lot_status.update({
        where: { id_lot: numeroLot },
        data: { current_step: 'prise_de_cotes' },
        
      });
    });

    res.status(200).json({ success: true, message: '✅ Données enregistrées avec succès.' });
  } catch (err) {
    console.error("Erreur lors de l'insertion dans debut_etching:", err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getAllDebutEtching = async (req: Request, res: Response): Promise<void> => {
    try {
        const results = await prisma.debut_etching.findMany();
        
        const formattedResults = results.map(row => ({
            ...row,
            date_debut: row.date_debut ? new Date(row.date_debut).toISOString().split('T')[0].replace(/-/g, '/') : null,
            heure_debut: row.heure_debut ? new Date(row.heure_debut).toTimeString().slice(0, 5) : null
        }));

        res.json(formattedResults);
    } catch (err) {
        console.error('Erreur lors de la récupération des données :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const getNbPassages = async (req: Request, res: Response): Promise<void> => {
    try {
        const lotId = parseInt(req.params.lotId);
        
        const count = await prisma.debut_etching.count({
            where: { id_lot: lotId }
        });

        res.json({ count });
    } catch (err) {
        console.error('Erreur lors du comptage des passages :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};