import { Router } from "express";
import { CatalogueController } from "../controllers/catalogueController";
import { BandDaoImpl, CapabilityDaoImpl } from "../dao/catalogueDaoImpl";
import { CatalogueService } from "../services/catalogueService";

const router = Router();
const capabilityController = new CatalogueController(
	new CatalogueService(new CapabilityDaoImpl()),
);
const bandController = new CatalogueController(
	new CatalogueService(new BandDaoImpl()),
);

router.get("/capabilities", async (_req, res) =>
	capabilityController.getAll(_req, res),
);
router.get("/bands", async (_req, res) => bandController.getAll(_req, res));

export default router;