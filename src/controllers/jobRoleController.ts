import type { Request, Response } from "express";
import Logger from "../lib/logger";
import type { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	async getAll(req: Request, res: Response): Promise<void> {
		try {
			const limit = this.parseLimit(req.query.limit);
			const offset = this.parseOffset(req.query.offset ?? req.query.start);

			if (limit === null || offset === null) {
				res.status(400).json({
					error: "limit must be a positive integer and offset must be a non-negative integer",
				});
				return;
			}

			const result = await this.jobRoleService.getAll({ limit, offset });
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

	private parseLimit(limitParam: unknown): number | null {
		if (limitParam === undefined) {
			return 10;
		}

		if (Array.isArray(limitParam)) {
			return null;
		}

		const limit = Number(limitParam);
		if (!Number.isInteger(limit) || limit <= 0) {
			return null;
		}

		return limit;
	}

	private parseOffset(offsetParam: unknown): number | null {
		if (offsetParam === undefined) {
			return 0;
		}

		if (Array.isArray(offsetParam)) {
			return null;
		}

		const offset = Number(offsetParam);
		if (!Number.isInteger(offset) || offset < 0) {
			return null;
		}

		return offset;
	}

	async getById(req: Request, res: Response): Promise<void> {
		try {
			const id = Number(req.params.id);

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
