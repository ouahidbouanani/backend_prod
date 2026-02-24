"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestVersionByPiece = exports.deleteVersion = exports.createVersion = exports.getAllVersions = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getAllVersions = async (req, res) => {
    try {
        const results = await prisma_1.default.version_piece.findMany();
        res.status(200).json(results);
    }
    catch (err) {
        console.error('Erreur lors de  récupération des versions :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getAllVersions = getAllVersions;
const createVersion = async (req, res) => {
    try {
        const { version, nom_piece } = req.body;
        if (!version || !nom_piece) {
            return res.status(400).json({ error: 'Version est requise' });
        }
        await prisma_1.default.version_piece.create({
            data: { version, nom_piece }
        });
        res.status(201).json({ message: 'Version ajoutée' });
    }
    catch (err) {
        console.error('Erreur ajout version :', err);
        if (err.code === 'P2002') {
            return res.status(409).json({ error: 'Cette version existe déjà' });
        }
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.createVersion = createVersion;
const deleteVersion = async (req, res) => {
    try {
        const version = req.params.version;
        const result = await prisma_1.default.version_piece.deleteMany({
            where: { version }
        });
        if (!result.count) {
            return res.status(404).json({ error: 'Version non trouvée' });
        }
        res.status(200).json({ message: 'Version supprimée', deleted: result.count });
    }
    catch (err) {
        console.error('Erreur suppression version :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.deleteVersion = deleteVersion;
const getLatestVersionByPiece = async (req, res) => {
    try {
        const nom_piece = req.query.n;
        if (!nom_piece) {
            return res.status(400).json({ error: 'Nom de pièce manquant' });
        }
        const results = await prisma_1.default.version_piece.findMany({
            where: { nom_piece: String(nom_piece) },
            select: { version: true }
        });
        if (results.length === 0) {
            return res.status(404).json({ message: 'Aucune version trouvée' });
        }
        res.json(results);
    }
    catch (err) {
        console.error('Erreur requête SQL :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.getLatestVersionByPiece = getLatestVersionByPiece;
