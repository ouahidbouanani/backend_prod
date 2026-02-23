import { Router } from "express";
import {
  getAvailableLotsForReference,
  getPiecesDisponiblesByLot,
  createDebutPreassemblage,
  listDebutPreassemblage,
  getDebutPreassemblageById,
  listDebutPreassemblageIds,
  getPiecesUtiliseesByProduitLot
} from "../../controllers/FormulairesFinis/DebutPreAssemblageController";

const router = Router();

/**
 * @openapi
 * /api/debutpreassemblage/lots-disponibles:
 *   get:
 *     tags: [PreAssemblage]
 *     summary: Lots disponibles pour une référence
 *     description: "Retourne les lots dispo (lot_status) pour la référence donnée."
 *     parameters:
 *       - in: query
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des lots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AvailableLot'
 *       400:
 *         description: Paramètre manquant
 */
router.get("/lots-disponibles", getAvailableLotsForReference);

/**
 * @openapi
 * /api/debutpreassemblage/pieces-disponibles:
 *   get:
 *     tags: [PreAssemblage]
 *     summary: Quantité de pièces disponibles par lot
 *     parameters:
 *       - in: query
 *         name: id_lot
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quantité disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PiecesDisponiblesResponse'
 *       400:
 *         description: Paramètre invalide
 */
router.get("/pieces-disponibles", getPiecesDisponiblesByLot);

/**
 * @openapi
 * /api/debutpreassemblage/listeIds:
 *   get:
 *     tags: [PreAssemblage]
 *     summary: Liste des IDs de début pré-assemblage
 *     parameters:
 *       - in: query
 *         name: activite
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: produit_fini
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tableau de strings (IDs)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get("/listeIds", listDebutPreassemblageIds);

/**
 * @openapi
 * /api/debutpreassemblage:
 *   get:
 *     tags: [PreAssemblage]
 *     summary: Lister les dossiers début pré-assemblage
 *     responses:
 *       200:
 *         description: Liste
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DebutPreassemblageListItem'
 */
router.get("/", listDebutPreassemblage);

/**
 * @openapi
 * /api/debutpreassemblage:
 *   post:
 *     tags: [PreAssemblage]
 *     summary: Créer un dossier début pré-assemblage
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DebutPreassemblageCreateRequest'
 *     responses:
 *       200:
 *         description: Créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DebutPreassemblageCreateResponse'
 *       400:
 *         description: Champs invalides
 *       409:
 *         description: Existe déjà
 */
router.post("/", createDebutPreassemblage);

// pièces déjà déclarées pour (produit_fini, lot_corps)
router.get("/pieces-utilisees", getPiecesUtiliseesByProduitLot);

/**
 * @openapi
 * /api/debutpreassemblage/{id}:
 *   get:
 *     tags: [PreAssemblage]
 *     summary: Détails d'un début pré-assemblage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DebutPreassemblageDetail'
 *       404:
 *         description: Introuvable
 */
router.get("/:id", getDebutPreassemblageById);



export default router;
