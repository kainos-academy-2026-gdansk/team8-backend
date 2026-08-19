import type { Request, Response } from "express";
import { CreateApplicationSchema } from "../dtos/ApplicationDto";
import Logger from "../lib/logger";
import { ApplicationError } from "../services/applicationService";
import type { ApplicationService } from "../services/applicationService";

type AuthLocals = {
	authUser: { userId: number };
	jobRoleId: number;
};

type ApplicationDecisionLocals = {
	jobRoleId: number;
	applicationId: number;
};

export class ApplicationController {
	constructor(private readonly applicationService: ApplicationService) {}

	async create(req: Request, res: Response): Promise<void> {
		const parsed = CreateApplicationSchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({ error: "Invalid request body" });
			return;
		}

		try {
			const { authUser, jobRoleId } = res.locals as AuthLocals;
			const application = await this.applicationService.createApplication(
				authUser.userId,
				jobRoleId,
				parsed.data,
			);
			res.status(201).json(application);
		} catch (error) {
			if (error instanceof ApplicationError) {
				res.status(error.statusCode).json({ error: error.message });
				return;
			}

			Logger.error(`Failed to create application: ${String(error)}`);
			res.status(500).json({ error: "Failed to create application" });
		}
	}

	async hire(_req: Request, res: Response): Promise<void> {
		try {
			const { jobRoleId, applicationId } = res.locals as ApplicationDecisionLocals;
			const application = await this.applicationService.hire(jobRoleId, applicationId);
			res.status(200).json(application);
		} catch (error) {
			if (error instanceof ApplicationError) {
				res.status(error.statusCode).json({ error: error.message });
				return;
			}

			Logger.error(`Failed to hire application: ${String(error)}`);
			res.status(500).json({ error: "Failed to hire application" });
		}
	}

	async reject(_req: Request, res: Response): Promise<void> {
		try {
			const { jobRoleId, applicationId } = res.locals as ApplicationDecisionLocals;
			const application = await this.applicationService.reject(jobRoleId, applicationId);
			res.status(200).json(application);
		} catch (error) {
			if (error instanceof ApplicationError) {
				res.status(error.statusCode).json({ error: error.message });
				return;
			}

			Logger.error(`Failed to reject application: ${String(error)}`);
			res.status(500).json({ error: "Failed to reject application" });
		}
	}
}
