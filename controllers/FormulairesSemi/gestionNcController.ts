import { Request, Response } from 'express';
// ============================================
// controllers/FormulairesSemi/gestionNcController.js
// ============================================
import prisma from '../../config/prisma';

export const declarerNc = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { id_lot, operateur, date, pieces } = req.body;

        if (!id_lot || !Array.isArray(pieces) || pieces.length === 0 || !operateur || !date) {
            return res.status(400).json({ message: 'Champs requis manquants ou invalides.' });
        }

        await prisma.nc_pieces.createMany({
            data: pieces.map(piece => ({
                id_lot: id_lot.toString(),
                id_piece: piece.id_piece,
                operateur,
                date: new Date(date),
                denomination: piece.denomination,
                produit: piece.produit,
                description: piece.description,
                type_de_production: piece.proud,
                type: piece.type,
                statut: 'Non traité'
            }))
        });

        res.status(201).json({ message: 'Déclaration NC enregistrée avec succès.' });
    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ message: 'Certaines pièces n\'ont pas pu être insérées.', error: err.message });
    }
};

export const getAllNc = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const results = await prisma.nc_pieces.findMany({
            orderBy: { date: 'desc' }
        });
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getNcNonTraitees = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const results = await prisma.nc_pieces.findMany({
            where: { statut: 'Non traité' }
        });
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getNcById = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const id = parseInt(req.params.id);
        const result = await prisma.nc_pieces.findUnique({
            where: { id }
        });
        
        if (!result) return res.status(404).json({ message: 'NC non trouvée' });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateNc = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const { decision, cause_racine, statut, justification, lien } = req.body;

        await prisma.nc_pieces.update({
            where: { id },
            data: { decision, cause_racine, statut, justification, lien }
        });

        res.status(200).json({ message: 'NC mise à jour' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const storeNcPieces = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { piece_info, lots_selections, operateur, date, commentaire = '' } = req.body;

        if (!piece_info || !lots_selections || !operateur || !date) {
            return res.status(400).json({ message: 'Données manquantes.' });
        }

        const insertData = [];

        lots_selections.forEach(lot => {
            const { id_lot, type_pieces, pieces_selectionnees } = lot;

            if (Array.isArray(pieces_selectionnees)) {
                pieces_selectionnees.forEach(id_piece => {
                    insertData.push({
                        id_lot: id_lot.toString(),
                        id_piece,
                        operateur,
                        date: new Date(date),
                        denomination: piece_info.denomination,
                        produit: piece_info.produit,
                        type_de_production: type_pieces,
                        type: piece_info.type,
                        description: piece_info.description,
                        justification: commentaire,
                        statut: 'En attente'
                    });
                });
            }
        });

        if (insertData.length === 0) {
            return res.status(400).json({ message: 'Aucune pièce à insérer.' });
        }

        const result = await prisma.nc_pieces.createMany({
            data: insertData
        });

        res.status(201).json({ message: 'Pièces insérées avec succès', insertedRows: result.count });
    } catch (err) {
        console.error('Erreur insertion:', err);
        res.status(500).json({ message: 'Erreur enregistrement en base.' });
    }
};