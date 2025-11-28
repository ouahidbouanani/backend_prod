"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/produitsFinisRoutes.ts
const express_1 = require("express");
const produitsFinisController_1 = require("../../controllers/admin/produitsFinisController");
const router = (0, express_1.Router)();
// GET /api/produits-finis
router.get('/', produitsFinisController_1.getProduitsFinis);
// POST /api/produits-finis
router.post('/', produitsFinisController_1.createProduitFini);
// DELETE /api/produits-finis/:id
router.delete('/:id', produitsFinisController_1.deleteProduitFini);
exports.default = router;
