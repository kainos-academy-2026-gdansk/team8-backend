import type { Request, Response } from "express";
import Logger from "../lib/logger";
import type { ApplicationService } from "../services/applicationService";
import type { JobRoleService } from "../services/jobRoleService";
import type {
	JobRoleIdLocals,
	JobRoleListLocals,
} from "../middleware/jobRoleRequestParsers";
import type { PaginatedJobRoleResponse } from "../dtos/JobRoleDto";
import type { CreateJobRoleLocals } from "../middleware/jobRoleRequestParsers";
import { UserRole } from "../models/UserRole";
import {
	JobRoleInputError,
	JobRoleNotFoundError,
} from "../services/jobRoleService";

export class JobRoleController {
	constructor(
		private readonly jobRoleService: JobRoleService,
		private readonly applicationService?: ApplicationService,
	) {}

	async getAll(req: Request, res: Response): Promise<void> {
		try {
			const { pagination, filters, ordering } = res.locals as JobRoleListLocals;
			const result = await this.jobRoleService.getAll({
				pagination,
				filters,
				ordering,
			});
			const basePath = req.baseUrl;

			const toLink = (value: number) => {
				const params = new URLSearchParams({
					limit: String(result.limit),
					offset: String(value),
				});

				if (ordering) {
					params.set("sortBy", ordering.field);
					params.set("sortOrder", ordering.direction);
				}

				return `${basePath}?${params.toString()}`;
			};

			const response: PaginatedJobRoleResponse = {
				data: result.data,
				total: result.total,
				limit: result.limit,
				offset: result.offset,
				links: {
					first: toLink(0),
					previous:
						!result.filtered && result.hasPrevious
							? toLink(Math.max(result.offset - result.limit, 0))
							: null,
					next:
						!result.filtered && result.hasNext
							? toLink(result.offset + result.limit)
							: null,
					last: toLink(result.lastOffset),
				},
			};

			res.status(200).json(response);
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
				return;
			}

			if (
				this.applicationService &&
				res.locals.authUser?.role === UserRole.ADMIN
			) {
				const applications = await this.applicationService.getApplicationsByJobRole(id);
				res.status(200).json({ ...jobRole, applications });
				return;
			}

			res.status(200).json(jobRole);
		} catch (error) {
			if (error instanceof Error && error.message === "Job role not found") {
				res.status(404).json({ error: error.message });
				return;
			}
			Logger.error(`Failed to fetch job role: ${String(error)}`);
			res.status(500).json({ error: "Failed to fetch job role" });
		}
	}

	async create(_req: Request, res: Response): Promise<void> {
		try {
			const { createJobRole } = res.locals as CreateJobRoleLocals;
			const jobRole = await this.jobRoleService.create(createJobRole);
			res.status(201).json(jobRole);
		} catch (error) {
			if (error instanceof JobRoleNotFoundError) {
				res.status(404).json({ error: error.message });
				return;
			}
			if (error instanceof JobRoleInputError) {
				res.status(500).json({ error: error.message });
				return;
			}
			Logger.error(`Failed to create job role: ${String(error)}`);
			res.status(500).json({ error: "Failed to create job role" });
		}
	}
}
