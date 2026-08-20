import { ApplicationStatus } from "../generated/prisma/client";
import type { ApplicationSummaryDto } from "../dtos/ApplicationDto";
import { Application } from "../models/Application";
import prisma from "../prismaClient";
import {
	ApplicationConflictError,
	ApplicationNotFoundError,
	DuplicateApplicationError,
	type ApplicationDao,
} from "./applicationDao";

function mapApplication(application: {
	id: number;
	userId: number;
	jobRoleId: number;
	cv: string;
	status: ApplicationStatus;
	createdAt: Date;
}): Application {
	return new Application(
		application.id,
		application.userId,
		application.jobRoleId,
		application.cv,
		application.status,
		application.createdAt,
	);
}

export class ApplicationDaoImpl implements ApplicationDao {
	async getByUserAndJobRole(
		userId: number,
		jobRoleId: number,
	): Promise<Application | null> {
		const application = await prisma.application.findUnique({
			where: { userId_jobRoleId: { userId, jobRoleId } },
		});

		return application ? mapApplication(application) : null;
	}

	async getByJobRole(jobRoleId: number): Promise<ApplicationSummaryDto[]> {
		const applications = await prisma.application.findMany({
			where: { jobRoleId },
			include: { user: true },
			orderBy: { createdAt: "asc" },
		});

		return applications.map((application) => ({
			id: application.id,
			jobRoleId: application.jobRoleId,
			applicantEmail: application.user.email,
			cv: application.cv,
			status: application.status,
			createdAt: application.createdAt,
		}));
	}

	async create(
		userId: number,
		jobRoleId: number,
		cv: string,
	): Promise<Application> {
		try {
			const application = await prisma.application.create({
				data: { userId, jobRoleId, cv, status: ApplicationStatus.IN_PROGRESS },
			});

			return mapApplication(application);
		} catch (error) {
			if (
				typeof error === "object" &&
				error !== null &&
				"code" in error &&
				error.code === "P2002"
			) {
				throw new DuplicateApplicationError();
			}

			throw error;
		}
	}

	async hire(jobRoleId: number, applicationId: number): Promise<Application> {
		return prisma.$transaction(async (tx) => {
			const application = await tx.application.findUnique({
				where: { id: applicationId },
			});

			if (!application || application.jobRoleId !== jobRoleId) {
				throw new ApplicationNotFoundError("Application not found");
			}

			if (application.status !== ApplicationStatus.IN_PROGRESS) {
				throw new ApplicationConflictError("Application is not in progress");
			}

			const jobRole = await tx.jobRole.findUnique({
				where: { id: jobRoleId },
				select: { numberOfOpenPositions: true },
			});

			if (!jobRole || jobRole.numberOfOpenPositions <= 0) {
				throw new ApplicationConflictError("No open positions available");
			}

			const updatedApplication = await tx.application.update({
				where: { id: applicationId, status: ApplicationStatus.IN_PROGRESS },
				data: { status: ApplicationStatus.HIRED },
			});

			const updatedJobRole = await tx.jobRole.update({
				where: {
					id: jobRoleId,
					numberOfOpenPositions: { gt: 0 },
				},
				data: { numberOfOpenPositions: { decrement: 1 } },
			});

			if (updatedJobRole.numberOfOpenPositions < 0) {
				throw new ApplicationConflictError("No open positions available");
			}

			return mapApplication(updatedApplication);
		});
	}

	async reject(jobRoleId: number, applicationId: number): Promise<Application> {
		const application = await prisma.application.findUnique({
			where: { id: applicationId },
		});

		if (!application || application.jobRoleId !== jobRoleId) {
			throw new ApplicationNotFoundError("Application not found");
		}

		if (application.status !== ApplicationStatus.IN_PROGRESS) {
			throw new ApplicationConflictError("Application is not in progress");
		}

		const updatedApplication = await prisma.application.update({
			where: { id: applicationId, status: ApplicationStatus.IN_PROGRESS },
			data: { status: ApplicationStatus.REJECTED },
		});

		return mapApplication(updatedApplication);
	}
}
