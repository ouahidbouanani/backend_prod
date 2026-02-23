import { Router } from "express";
import { createFinPreassemblage,  getFinPreassemblageById, getFinPreassemblageIds, getFinPreassemblageIdsDisponiblesPourDebutAssemblage } from "../../controllers/FormulairesFinis/FinPreAssemblageController";

const router = Router();

/**
 * @openapi
 * /api/finpreassemblage:
 *   post:
 *     tags: [PreAssemblage]
 *     summary: Créer la fin pré-assemblage (QC)
 *     description: "Crée la FIN pour un dossier de début pré-assemblage + lignes QC."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinPreassemblageCreateRequest'
 *     responses:
 *       201:
 *         description: Créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinPreassemblageCreateResponse'
 *       400:
 *         description: Champs invalides
 *       404:
 *         description: Début introuvable
 *       409:
 *         description: Fin déjà existante
 */
router.post("/", createFinPreassemblage);

/**
 * @openapi
 * /api/finpreassemblage/ids:
 *   get:
 *     tags: [PreAssemblage]
 *     summary: Liste des IDs fin pré-assemblage
 *     responses:
 *       200:
 *         description: Tableau de strings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get("/ids", getFinPreassemblageIds);

router.get("/ids-disponibles-debut-assemblage", getFinPreassemblageIdsDisponiblesPourDebutAssemblage);

/**
 * @openapi
 * /api/finpreassemblage/{id}:
 *   get:
 *     tags: [PreAssemblage]
 *     summary: Détails fin pré-assemblage
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
 *               $ref: '#/components/schemas/FinPreassemblageDetail'
 *       404:
 *         description: Introuvable
 */
router.get("/:id", getFinPreassemblageById);

export default router;
