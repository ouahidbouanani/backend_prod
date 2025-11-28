import { Request, Response } from 'express';
// ============================================
// controllers/FormulairesSemi/suiviController.js
// ============================================
import prisma from '../../config/prisma';

export const getLotsProgress = async (req: Request, res: Response): Promise<void> => {
    try {
        const results = await prisma.lot_status.findMany({
            select: {
                id_lot: true,
                activity: true,
                nb_pieces: true,
                current_step: true,
                type_piece: true,
                revision: true
            }
        });
        res.json(results);
    } catch (error) {
        console.error("Erreur lors de la récupération des lots :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};