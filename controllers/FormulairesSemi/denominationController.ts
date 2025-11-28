import { Request, Response } from 'express';
// ============================================
// controllers/FormulairesSemi/denominationController.js
// ============================================
import prisma from '../../config/prisma';

export const getAllDenominations = async (req: Request, res: Response): Promise<void> => {
    try {
        const results = await prisma.denomination_options.findMany({
            select: { name: true }
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

export const createDenomination = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Nom requis' });

        const result = await prisma.denomination_options.create({
            data: { name }
        });

        res.status(201).json({ id: result.id, name });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de l\'insertion', error: err.message });
    }
};
