"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImpressions = exports.addImpression = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const addImpression = async (req, res) => {
    try {
        const { activity, typePieces, versionPiece, num_lot_wafer, nbPieces, imprimante, dateImpression, operateur, commentaire } = req.body;
        const result = await prisma_1.default.nouvelle_impression.create({
            data: {
                activity, type_pieces: typePieces, version_piece: versionPiece,
                num_lot_wafer, nb_pieces: nbPieces, imprimante,
                date_impression: new Date(dateImpression), operateur, commentaire
            }
        });
        const id_lot = result.id;
        await prisma_1.default.lot_status.upsert({
            where: { id_lot: id_lot },
            update: { current_step: 'nouvelle_impression' },
            create: {
                id_lot: id_lot,
                nb_pieces: nbPieces,
                current_step: 'nouvelle_impression',
                activity,
                type_piece: typePieces,
                revision: versionPiece
            }
        });
        res.status(200).json({ success: true, message: 'Données enregistrées et statut mis à jour' });
    }
    catch (err) {
        console.error('❌ Erreur lors de l\'insertion:', err);
        res.status(500).json({ success: false, message: 'Erreur dans la base de données' });
    }
};
exports.addImpression = addImpression;
const getImpressions = async (req, res) => {
    try {
        const results = await prisma_1.default.nouvelle_impression.findMany();
        res.status(200).json(results);
    }
    catch (err) {
        console.error('❌ Erreur lors de la récupération des données:', err);
        res.status(500).json({ success: false, message: 'Erreur dans la récupération des données' });
    }
};
exports.getImpressions = getImpressions;
