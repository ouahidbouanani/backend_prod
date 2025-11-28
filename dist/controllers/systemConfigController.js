"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrinter = exports.getAllPrinters = exports.createActivity = exports.getAllActivities = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getAllActivities = async (req, res) => {
    try {
        const results = await prisma_1.default.activites.findMany();
        res.json(results);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getAllActivities = getAllActivities;
const createActivity = async (req, res) => {
    try {
        const { nom } = req.body;
        if (!nom)
            return res.status(400).json({ error: 'Nom requis' });
        const result = await prisma_1.default.activites.create({
            data: { nom }
        });
        res.status(201).json({ id: result.id, nom });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createActivity = createActivity;
const getAllPrinters = async (req, res) => {
    try {
        const results = await prisma_1.default.imprimantes.findMany();
        res.json(results);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getAllPrinters = getAllPrinters;
const createPrinter = async (req, res) => {
    try {
        const { nom } = req.body;
        if (!nom)
            return res.status(400).json({ error: 'Nom requis' });
        const result = await prisma_1.default.imprimantes.create({
            data: { nom }
        });
        res.status(201).json({ id: result.id, nom });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createPrinter = createPrinter;
