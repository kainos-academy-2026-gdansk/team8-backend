import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import { JobRoleService } from "../services/jobRoleService";
import { JobRoleDaoImpl } from "../dao/jobRoleDaoImpl";

const router = Router();
const controller = new JobRoleController(new JobRoleService(new JobRoleDaoImpl()));

router.get("/", async (_req, res) => controller.getAll(_req, res));

export default router;
