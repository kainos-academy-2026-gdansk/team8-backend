import type { Request, Response } from "express";
import Logger from "../lib/logger";
import type { JobRoleService } from "../services/jobRoleService";
import type {
	JobRoleIdLocals,
	JobRoleListLocals,
} from "../middleware/jobRoleRequestParsers";

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	async getAll(req: Request, res: Response): Promise<void> {
		try {
			const { pagination } = res.locals as JobRoleListLocals;
			const result = await this.jobRoleService.getAll(pagination);
			const basePath = req.baseUrl;

			const toLink = (value: number) =>
				`${basePath}?limit=${result.limit}&offset=${value}`;

			res.status(200).json({
				data: result.data,
				total: result.total,
				limit: result.limit,
				offset: result.offset,
				links: {
					first: toLink(0),
					previous: result.hasPrevious
						? toLink(Math.max(result.offset - result.limit, 0))
						: null,
					next: result.hasNext ? toLink(result.offset + result.limit) : null,
					last: toLink(result.lastOffset),
				},
			});
		} catch (error) {
			Logger.error(`Failed to fetch job roles: ${String(error)}`);
			res.status(500).json({ error: "Failed to fetch job roles" });
		}
	}

	async getById(_req: Request, res: Response): Promise<void> {
		try {
			const { jobRoleId: id } = res.locals as JobRoleIdLocals;
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
