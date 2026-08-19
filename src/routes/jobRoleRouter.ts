import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import { ApplicationController } from "../controllers/applicationController";
import { ApplicationDaoImpl } from "../dao/applicationDaoImpl";
import { JobRoleService } from "../services/jobRoleService";
import { ApplicationService } from "../services/applicationService";
import { JobRoleDaoImpl } from "../dao/jobRoleDaoImpl";
import { requireAdmin } from "../middleware/requireAdmin";
import {
	parseJobRoleListFilters,
	validateCreateJobRole,
	validateJobRoleIdParam,
	validateJobRoleListOrdering,
	validateJobRoleListPagination,
} from "../middleware/jobRoleRequestParsers";

const router = Router();
const controller = new JobRoleController(
	new JobRoleService(new JobRoleDaoImpl()),
);
const applicationController = new ApplicationController(
	new ApplicationService(new ApplicationDaoImpl(), new JobRoleDaoImpl()),
);

router.get(
	"/",
	validateJobRoleListPagination,
	parseJobRoleListFilters,
	validateJobRoleListOrdering,
	async (_req, res) => controller.getAll(_req, res),
);
router.post("/", requireAdmin, validateCreateJobRole, async (_req, res) =>
	controller.create(_req, res),
);
router.get("/:id", validateJobRoleIdParam, async (_req, res) =>
	controller.getById(_req, res),
);
router.post("/:id/applications", validateJobRoleIdParam, async (_req, res) =>
	applicationController.create(_req, res),
);

export default router;
