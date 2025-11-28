import { Request, Response } from 'express';
// ============================================
// controllers/FormulairesSemi/cotesController.js
// ============================================
import prisma from '../../config/prisma';

export const getCotesByLotId = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { id_lot, nb_passage } = req.params;

        const results = await prisma.mesure_cote_piece.findMany({
            where: {
                id_lot: parseInt(id_lot),
                nb_passage: parseInt(nb_passage)
            },
            select: {
                id_piece_locale: true,
                id_lot: true,
                id_cote_piece: true,
                valeur: true
            }
        });

        res.json(results);
    } catch (error) {
        console.error('Erreur lors de la récupération des cotes :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};