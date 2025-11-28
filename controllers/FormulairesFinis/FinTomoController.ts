import { Request, Response } from 'express';
// ============================================
// controllers/FormulairesFinis/FinTomoController.js
// ============================================
import prisma from '../../config/prisma';
export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, quantite, date, heure, operateur } = req.body;

        await prisma.fintomo_finis.create({
            data: {
                id, quantite,
                date: new Date(date),
                heure: new Date(`1970-01-01T${heure}`),
                operateur
            }
        });

        res.status(201).json({ message: 'Fin de tomographie enregistrée et statut mis à jour' });
    } catch (err) {
        console.error('Erreur insertion fin_tomo :', err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'insertion fin_tomo' });
    }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
    try {
        const results = await prisma.fintomo_finis.findMany();
        res.json(results);
    } catch (err) {
        console.error('Erreur récupération :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const getLots = async (req: Request, res: Response): Promise<void> => {
    try {
        const results = await prisma.debuttomo_finis.findMany({
            select: { id: true }
        });
        res.json(results);
    } catch (err) {
        console.error('Erreur lors de la récupération des lots:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};