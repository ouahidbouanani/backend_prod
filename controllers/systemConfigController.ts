import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getAllActivities = async (req: Request, res: Response): Promise<void> => {
    try {
        const results = await prisma.activites.findMany();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createActivity = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { nom } = req.body;
        if (!nom) return res.status(400).json({ error: 'Nom requis' });

        const result = await prisma.activites.create({
            data: { nom }
        });

        res.status(201).json({ id: result.id, nom });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllPrinters = async (req: Request, res: Response): Promise<void> => {
    try {
        const results = await prisma.imprimantes.findMany();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createPrinter = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { nom } = req.body;
        if (!nom) return res.status(400).json({ error: 'Nom requis' });

        const result = await prisma.imprimantes.create({
            data: { nom }
        });

        res.status(201).json({ id: result.id, nom });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};