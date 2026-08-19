import type { ApplicationSummaryDto } from "../dtos/ApplicationDto";
import type { Application } from "../models/Application";

export class DuplicateApplicationError extends Error {}

export class ApplicationConflictError extends Error {
	constructor(message: string) {
		super(message);
	}
}

export class ApplicationNotFoundError extends Error {}

export interface ApplicationDao {
	getByUserAndJobRole(
		userId: number,
		jobRoleId: number,
	): Promise<Application | null>;
	getByJobRole(jobRoleId: number): Promise<ApplicationSummaryDto[]>;
	create(userId: number, jobRoleId: number, cv: string): Promise<Application>;
	hire(jobRoleId: number, applicationId: number): Promise<Application>;
	reject(jobRoleId: number, applicationId: number): Promise<Application>;
}
