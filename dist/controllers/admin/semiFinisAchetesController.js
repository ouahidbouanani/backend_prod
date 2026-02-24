"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSemiFiniAchete = exports.createSemiFiniAchete = exports.getSemiFinisAchetes = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const getSemiFinisAchetes = async (req, res, next) => {
    try {
        const items = await prisma_1.default.semiFiniAchete.findMany({
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
        const item = await prisma_1.default.semiFiniAchete.create({
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
        await prisma_1.default.semiFiniAchete.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSemiFiniAchete = deleteSemiFiniAchete;
