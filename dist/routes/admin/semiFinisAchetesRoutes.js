"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/semiFinisAchetesRoutes.ts
const express_1 = require("express");
const semiFinisAchetesController_1 = require("../../controllers/admin/semiFinisAchetesController");
const router = (0, express_1.Router)();
// GET /api/semi-finis-achetes
router.get('/', semiFinisAchetesController_1.getSemiFinisAchetes);
// POST /api/semi-finis-achetes
router.post('/', semiFinisAchetesController_1.createSemiFiniAchete);
// DELETE /api/semi-finis-achetes/:id
router.delete('/:id', semiFinisAchetesController_1.deleteSemiFiniAchete);
exports.default = router;
