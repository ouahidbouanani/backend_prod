import { Request, Response } from 'express';
// ============================================
// controllers/pieceController.js
// ============================================
import prisma from '../config/prisma';

export const ajouterPiece = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { nom_piece, nb_cotes, cotes } = req.body;

        if (!nom_piece || !nb_cotes || !Array.isArray(cotes)) {
            return res.status(400).json({ message: 'Champs invalides' });
        }

        const result = await prisma.piece.create({
            data: { nom: nom_piece, nb_cotes }
        });

        const pieceId = result.id;

        await prisma.cote_piece.createMany({
            data: cotes.map(cote => ({
                piece_id: pieceId,
                nom_cote: cote.nom_cote,
                tolerance_min: cote.tolerance_min,
                tolerance_max: cote.tolerance_max
            }))
        });

        res.status(201).json({ message: 'Pièce et côtés enregistrés avec succès.' });
    } catch (err) {
        console.error('Erreur lors de l\'insertion de la pièce :', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const getAllPieces = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const pieces = await prisma.piece.findMany({
      include: {
        cotes: true, // ⚠️ correspond au nom du champ dans le model `piece`
      },
      orderBy: {
        id: 'asc',
      },
    });

    const formatted = pieces.map((piece) => ({
      id: piece.id,
      nom: piece.nom,
      nb_cotes: piece.nb_cotes,
      cotes: (piece.cotes || []).map((cote) => ({
        id: cote.id,
        nom_cote: cote.nom_cote,
        tolerance_min: cote.tolerance_min,
        tolerance_max: cote.tolerance_max,
      })),
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Erreur lors de la récupération des pièces :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getAllPiecesName = async (req: Request, res: Response): Promise<void> => {
    try {
        const pieces = await prisma.piece.findMany({
            select: { nom: true },
            orderBy: { id: 'asc' }
        });

        const names = pieces.map(row => row.nom);
        res.json(names);
    } catch (err) {
        console.error("Erreur lors de la récupération des noms des pièces :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getPieceById = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const pieceId = parseInt(req.params.id, 10);

    if (isNaN(pieceId)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const piece = await prisma.piece.findUnique({
      where: { id: pieceId },
      include: {
        cotes: true, 
      },
    });

    if (!piece) {
      return res.status(404).json({ message: "Pièce non trouvée" });
    }

    const formatted = {
      id: piece.id,
      nom: piece.nom,
      nb_cotes: piece.nb_cotes,
      cotes: (piece.cotes || []).map((cote) => ({
        id: cote.id,
        nom_cote: cote.nom_cote,
        tolerance_min: cote.tolerance_min,
        tolerance_max: cote.tolerance_max,
      })),
    };

    return res.status(200).json(formatted);
  } catch (err) {
    console.error("Erreur lors de la récupération de la pièce :", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deletePiece = async (req: Request, res: Response): Promise<void> => {
    try {
        const pieceId = parseInt(req.params.id);

        await prisma.$transaction(async (tx) => {
            await tx.cote_piece.deleteMany({ where: { piece_id: pieceId } });
            await tx.piece.delete({ where: { id: pieceId } });
        });

        res.status(200).json({ message: 'Pièce et ses cotes supprimées avec succès' });
    } catch (err) {
        console.error('Erreur suppression pièce:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const getTypePieces = async (req: Request, res: Response): Promise<void> => {
    try {
        const results = await prisma.piece.findMany({
            select: { nom: true },
            distinct: ['nom']
        });
        res.json(results);
    } catch (err) {
        console.error("erreur lors de la récupération des types:", err);
        res.status(500).json({ error: "erreur lors de la récupération des types" });
    }
};
// modifier une pièce
export const updatePiece = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const pieceId = parseInt(req.params.id, 10);

    if (isNaN(pieceId)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const { nom_piece, nb_cotes, cotes } = req.body;

    if (!nom_piece || !nb_cotes || !Array.isArray(cotes) || cotes.length === 0) {
      return res.status(400).json({ message: "Champs invalides" });
    }

    // 1️⃣ Vérifier que la pièce existe
    const piece = await prisma.piece.findUnique({
      where: { id: pieceId },
    });

    if (!piece) {
      return res.status(404).json({ message: "Pièce non trouvée" });
    }

    // 2️⃣ Transaction : update pièce + reset des cotes
    await prisma.$transaction(async (tx) => {
      // 2.a Mettre à jour la pièce
      await tx.piece.update({
        where: { id: pieceId },
        data: {
          nom: nom_piece,
          nb_cotes: Number(nb_cotes),
        },
      });

      // 2.b Supprimer les anciennes cotes
      await tx.cote_piece.deleteMany({
        where: { piece_id: pieceId },
      });

      // 2.c Insérer les nouvelles cotes
      await tx.cote_piece.createMany({
        data: cotes.map((cote) => ({
          piece_id: pieceId,
          nom_cote: cote.nom_cote,
          tolerance_min: cote.tolerance_min,
          tolerance_max: cote.tolerance_max,
        })),
      });
    });

    return res.status(200).json({ message: "Pièce mise à jour avec succès" });
  } catch (err) {
    console.error("Erreur update pièce:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
