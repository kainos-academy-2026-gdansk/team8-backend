import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import { ApplicationController } from "../controllers/applicationController";
import { ApplicationDaoImpl } from "../dao/applicationDaoImpl";
import { JobRoleService } from "../services/jobRoleService";
import { ApplicationService } from "../services/applicationService";
import { JobRoleDaoImpl } from "../dao/jobRoleDaoImpl";
import {
	parseJobRoleListFilters,
	validateJobRoleIdParam,
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
	async (_req, res) => controller.getAll(_req, res),
);
router.get("/:id", validateJobRoleIdParam, async (_req, res) =>
	controller.getById(_req, res),
);
router.post("/:id/applications", validateJobRoleIdParam, async (_req, res) =>
	applicationController.create(_req, res),
);

export default router;
