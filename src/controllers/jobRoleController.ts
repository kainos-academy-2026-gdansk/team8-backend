import type { Request, Response } from "express";
import Logger from "../lib/logger";
import type { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	async getAll(_req: Request, res: Response): Promise<void> {
		try {
			const jobRoles = await this.jobRoleService.getAll();
			res.status(200).json(jobRoles);
		} catch (error) {
			Logger.error(`Failed to fetch job roles: ${String(error)}`);
			res.status(500).json({ error: "Failed to fetch job roles" });
		}
	}

	async getById(_req: Request, res: Response): Promise<void> {
		try {
			const id = Number(_req.params.id);

			if (!Number.isInteger(id) || id <= 0) {
				res.status(400).json({ error: "Id should be a positive number" });
				return;
			}

			const jobRole = await this.jobRoleService.getById(id);

			if (!jobRole) {
				res.status(404).json({ error: "Job role not found" });
			} else {
				res.status(200).json(jobRole);
			}
		} catch (error) {
			Logger.error(`Failed to fetch job role: ${String(error)}`);
			res.status(500).json({ error: "Failed to fetch job role" });
		}
	}
}
