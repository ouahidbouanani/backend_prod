import express from "express";
import {
	createDebutHydroFinis,
	getDebutHydroFinisById,
	getLotsDebutHydroFinis,
	getPiecesDisponiblesForHydroLot,
} from "../../controllers/FormulairesFinis/DebutHydroController";

const router = express.Router();

router.get("/lots", getLotsDebutHydroFinis);
router.get("/pieces", getPiecesDisponiblesForHydroLot);
router.post("/", createDebutHydroFinis);
router.get("/:id", getDebutHydroFinisById);

export default router;
