import { Request, Response } from 'express';
// ============================================
// controllers/FormulairesSemi/finImpressionController.js
// ============================================
import prisma from '../../config/prisma';

export const dbInsertFinImpression = async (req, res) => {
    try {
        const {
            id_lot, num_lot_wafer, nb_lancees, nb_imprimees,
            operateur, date_fin, commentaires
        } = req.body;

        await prisma.$transaction(async (tx) => {
            await tx.fin_impression.create({
                data: {
                    id_lot, num_lot_wafer, nb_lancees, nb_imprimees,
                    operateur, date_fin: new Date(date_fin), commentaires
                }
            });

            await tx.lot_status.update({
                where: { id_lot: id_lot },
                data: { current_step: 'debut_etching' },
            });
        });

        res.status(200).json({ success: true, message: 'Toutes les données enregistrées avec succès' });
    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

export const getAllLots = async (req, res) => {
  try {
    // Récupère tous les id_lot de fin_impression
    const finis = await prisma.fin_impression.findMany({
      select: { id_lot: true }
    });

    // Liste des ids déjà utilisés
    const idsUtilises = finis.map(item => item.id_lot);

    // Récupère tous les lots qui ne sont PAS dans fin_impression
    const results = await prisma.nouvelle_impression.findMany({
      where: {
        id: { notIn: idsUtilises }
      },
      select: { id: true }
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};


export const getLotDetails = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await prisma.nouvelle_impression.findUnique({
            where: { id },
            select: { nb_pieces: true, num_lot_wafer: true, type_pieces: true }
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
