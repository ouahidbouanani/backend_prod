"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DebutHydroController_1 = require("../../controllers/FormulairesFinis/DebutHydroController");
const router = express_1.default.Router();
router.get("/lots", DebutHydroController_1.getLotsDebutHydroFinis);
router.get("/pieces", DebutHydroController_1.getPiecesDisponiblesForHydroLot);
router.post("/", DebutHydroController_1.createDebutHydroFinis);
router.get("/:id", DebutHydroController_1.getDebutHydroFinisById);
exports.default = router;
