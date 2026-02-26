"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSemiFiniAchete = exports.createSemiFiniAchete = exports.getSemiFinisAchetes = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getSemiFinisAchetes = async (req, res, next) => {
    try {
        const items = await prisma.semiFiniAchete.findMany({
            orderBy: { nom: 'asc' },
        });
        res.json(items);
    }
    catch (error) {
        next(error);
    }
};
exports.getSemiFinisAchetes = getSemiFinisAchetes;
const createSemiFiniAchete = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.createSemiFiniAchete = createSemiFiniAchete;
const deleteSemiFiniAchete = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: 'ID invalide.' });
        }
        await prisma.semiFiniAchete.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSemiFiniAchete = deleteSemiFiniAchete;
