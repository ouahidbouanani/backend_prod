// src/controllers/semiFinisAchetesController.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSemiFinisAchetes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.semiFiniAchete.findMany({
      orderBy: { nom: 'asc' },
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const createSemiFiniAchete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nom } = req.body;

    if (!nom) {
      return res.status(400).json({ message: 'Le nom est obligatoire.' });
    }

    const item = await prisma.semiFiniAchete.create({
      data: {
        nom,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const deleteSemiFiniAchete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'ID invalide.' });
    }

    await prisma.semiFiniAchete.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
