import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const addImpression = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            activity, typePieces, versionPiece, num_lot_wafer, nbPieces,
            imprimante, dateImpression, operateur, commentaire
        } = req.body;

        const result = await prisma.nouvelle_impression.create({
            data: {
                activity, type_pieces: typePieces, version_piece: versionPiece,
                num_lot_wafer, nb_pieces: nbPieces, imprimante,
                date_impression: new Date(dateImpression), operateur, commentaire
            }
        });

        const id_lot = result.id;

        await prisma.lot_status.upsert({
            where: { id_lot: id_lot },
            update: { current_step: 'fin_impression' },
            create: {
                id_lot: id_lot,
                nb_pieces: nbPieces,
                current_step: 'fin_impression',
                activity,
                type_piece: typePieces,
                revision: versionPiece,
                disponible_finis: false,
            }
        });

        res.status(200).json({ success: true, message: 'Données enregistrées et statut mis à jour' });
    } catch (err) {
        console.error('❌ Erreur lors de l\'insertion:', err);
        res.status(500).json({ success: false, message: 'Erreur dans la base de données' });
    }
};

export const getImpressions = async (req: Request, res: Response): Promise<void> => {
    try {
        const results = await prisma.nouvelle_impression.findMany();
        res.status(200).json(results);
    } catch (err) {
        console.error('❌ Erreur lors de la récupération des données:', err);
        res.status(500).json({ success: false, message: 'Erreur dans la récupération des données' });
    }
};