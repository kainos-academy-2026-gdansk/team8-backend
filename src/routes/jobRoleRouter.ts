import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import { JobRoleService } from "../services/jobRoleService";

const router = Router();
const controller = new JobRoleController(new JobRoleService());

router.get("/", async (_req, res) => controller.getAll(_req, res));

export default router;
