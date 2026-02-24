import express from "express";
import {
	createFinHydroFinis,
	getFinHydroFinisById,
	getLotsFinHydroFinis,
} from "../../controllers/FormulairesFinis/FinHydroController";

const router = express.Router();

router.get("/lots", getLotsFinHydroFinis);
router.get("/:id", getFinHydroFinisById);
router.post("/", createFinHydroFinis);

export default router;
