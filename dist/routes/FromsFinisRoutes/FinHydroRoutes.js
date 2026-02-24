"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FinHydroController_1 = require("../../controllers/FormulairesFinis/FinHydroController");
const router = express_1.default.Router();
router.get("/lots", FinHydroController_1.getLotsFinHydroFinis);
router.get("/:id", FinHydroController_1.getFinHydroFinisById);
router.post("/", FinHydroController_1.createFinHydroFinis);
exports.default = router;
