import type { Application } from "../models/Application";

export class DuplicateApplicationError extends Error {}

export interface ApplicationDao {
	getByUserAndJobRole(
		userId: number,
		jobRoleId: number,
	): Promise<Application | null>;
	create(userId: number, jobRoleId: number, cv: string): Promise<Application>;
}
