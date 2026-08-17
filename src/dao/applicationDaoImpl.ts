import { ApplicationStatus } from "../generated/prisma/client";
import { Application } from "../models/Application";
import prisma from "../prismaClient";
import {
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
}
