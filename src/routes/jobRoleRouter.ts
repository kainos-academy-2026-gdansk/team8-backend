import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import { JobRoleService } from "../services/jobRoleService";
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

router.get(
	"/",
	validateJobRoleListPagination,
	parseJobRoleListFilters,
	async (_req, res) => controller.getAll(_req, res),
);
router.get("/:id", validateJobRoleIdParam, async (_req, res) =>
	controller.getById(_req, res),
);

export default router;
