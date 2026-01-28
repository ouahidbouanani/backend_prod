import express from 'express';
const router = express.Router();
import * as controller from '../../controllers/FormulairesFinis/AssemblageController';


/**
 * @openapi
 * /api/assemblage/lots-disponibles:
 *   get:
 *     tags: [Assemblage]
 *     summary: Lots disponibles (assemblage)
 *     responses:
 *       200:
 *         description: Liste des lots
 */

/**
 * @openapi
 * /api/debut-assemblage/lots-disponibles:
 *   get:
 *     tags: [Assemblage]
 *     summary: Lots disponibles (alias début-assemblage)
 *     description: "Même endpoint exposé sous 2 préfixes (router monté deux fois)."
 *     responses:
 *       200:
 *         description: Liste des lots
 */


router.get('/lots-disponibles', controller.getAvailableLotsForReference);

export default router;