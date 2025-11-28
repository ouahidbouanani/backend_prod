"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduitFini = exports.createProduitFini = exports.getProduitsFinis = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * GET /api/produits-finis
 * Récupère tous les produits finis avec leurs références
 */
const getProduitsFinis = async (req, res, next) => {
    try {
        const produits = await prisma.produitFini.findMany({
            orderBy: { createdAt: 'desc' },
            include: { references: true },
        });
        res.json(produits);
    }
    catch (error) {
        next(error);
    }
};
exports.getProduitsFinis = getProduitsFinis;
/**
 * POST /api/produits-finis
 * body: { nom: string, references: ProduitFiniReferenceInput[] }
 */
const createProduitFini = async (req, res, next) => {
    try {
        const { nom, references } = req.body;
        if (!nom) {
            return res.status(400).json({ message: 'Le nom du produit fini est obligatoire.' });
        }
        if (!references || !Array.isArray(references) || references.length === 0) {
            return res.status(400).json({ message: 'Au moins une référence est requise.' });
        }
        const refsValides = references.filter((r) => r.nom && r.nom.trim() !== '' && r.quantite && r.quantite > 0);
        if (!refsValides.length) {
            return res.status(400).json({ message: 'Aucune référence valide.' });
        }
        const created = await prisma.produitFini.create({
            data: {
                nom,
                references: {
                    create: refsValides.map((r) => ({
                        type: r.type,
                        nom: r.nom,
                        quantite: r.quantite,
                        tracerNumeroLot: !!r.tracerNumeroLot,
                    })),
                },
            },
            include: { references: true },
        });
        res.status(201).json(created);
    }
    catch (error) {
        next(error);
    }
};
exports.createProduitFini = createProduitFini;
/**
 * DELETE /api/produits-finis/:id
 */
const deleteProduitFini = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: 'ID invalide.' });
        }
        // Si tu n'as pas onDelete: Cascade, il faut d'abord supprimer les références :
        // await prisma.produitFiniReference.deleteMany({ where: { produitFiniId: id } });
        await prisma.produitFini.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduitFini = deleteProduitFini;
