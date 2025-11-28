import { Request, Response } from 'express';
// ============================================
// controllers/FormulairesFinis/DebutTomoController.js
// ============================================
import prisma from '../../config/prisma';
export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            id, nb_pieces, etage, date, heure_debut, operateur,
            num_machine, version, separation, commentaire
        } = req.body;

        await prisma.debuttomo_finis.create({
            data: {
                id, nb_pieces, etage,
                date: new Date(date),
                heure_debut: new Date(`1970-01-01T${heure_debut}`),
                operateur, num_machine, version, separation, commentaire
            }
        });

        res.status(201).json({ message: 'Début de tomographie enregistré et statut mis à jour' });
    } catch (err) {
        console.error('Erreur d\'insertion :', err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement' });
    }
};

export const getLots = async (req: Request, res: Response): Promise<void> => {
    try {
        const results = await prisma.assemblage.findMany({
            select: { id: true }
        });
        res.json(results);
    } catch (err) {
        console.error('Erreur lors de la récupération des lots:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};