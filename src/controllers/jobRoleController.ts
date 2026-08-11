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
}
