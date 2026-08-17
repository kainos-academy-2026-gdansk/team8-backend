import {
	DuplicateApplicationError,
	type ApplicationDao,
} from "../dao/applicationDao";
import type { JobRoleDao } from "../dao/jobRoleDao";
import type {
	ApplicationResponseDto,
	CreateApplicationRequestDto,
} from "../dtos/ApplicationDto";
import type { Application } from "../models/Application";

export class ApplicationError extends Error {
	constructor(
		message: string,
		public readonly statusCode: 404 | 409 | 423,
	) {
		super(message);
	}
}

export class ApplicationService {
	constructor(
		private readonly applicationDao: ApplicationDao,
		private readonly jobRoleDao: JobRoleDao,
	) {}

	async createApplication(
		userId: number,
		jobRoleId: number,
		input: CreateApplicationRequestDto,
	): Promise<ApplicationResponseDto> {
		const jobRole = await this.jobRoleDao.getById(jobRoleId);
		if (!jobRole) {
			throw new ApplicationError("Job role not found", 404);
		}

		if (jobRole.status.name !== "OPEN" || jobRole.numberOfOpenPositions <= 0) {
			throw new ApplicationError(
				"Job role is not available for applications",
				423,
			);
		}

		const existing = await this.applicationDao.getByUserAndJobRole(
			userId,
			jobRoleId,
		);
		if (existing) {
			throw new ApplicationError(
				"Application already exists for this job role",
				409,
			);
		}

		let application: Application;
		try {
			application = await this.applicationDao.create(
				userId,
				jobRoleId,
				input.cv,
			);
		} catch (error) {
			if (error instanceof DuplicateApplicationError) {
				throw new ApplicationError(
					"Application already exists for this job role",
					409,
				);
			}

			throw error;
		}

		return {
			id: application.id,
			jobRoleId: application.jobRoleId,
			status: application.status,
			createdAt: application.createdAt,
		};
	}
}
