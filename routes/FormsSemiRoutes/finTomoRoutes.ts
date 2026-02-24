import express from 'express';
const router = express.Router();
import * as finTomoController from '../../controllers/FormulairesSemi/finTomoController';


/**
 * @openapi
 * /api/fin-tomo/add:
 *   post:
 *     tags: [Tomo]
 *     summary: Créer une fin tomographie (semi)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Créé
 */
router.post('/add', finTomoController.create)

/**
 * @openapi
 * /api/fin-tomo/all:
 *   get:
 *     tags: [Tomo]
 *     summary: Lister les fins tomographie (semi)
 *     responses:
 *       200:
 *         description: Liste
 */
router.get('/all', finTomoController.getAll)


/**
 * /api/fin-tomo/options/activities:
 */
router.get('/options/activities', finTomoController.getActivities);

/**
 * /api/fin-tomo/options/type-pieces:
 */
router.get('/options/type-pieces', finTomoController.getTypePiecesOptions);


/**
 * @openapi
 * /api/fin-tomo/lots:
 *   get:
 *     tags: [Tomo]
 *     summary: Lister les lots disponibles (fin tomo)
 *     responses:
 *       200:
 *         description: Liste
 */
router.get('/lots', finTomoController.getLots);

export default router;