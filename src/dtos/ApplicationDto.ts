import { z } from "zod";
import type { ApplicationStatus } from "../models/Application";

export const CreateApplicationSchema = z.object({
	cv: z
		.string()
		.trim()
		.min(1)
		.max(5000, "CV must be between 1 and 5000 characters"),
});

export type CreateApplicationRequestDto = z.infer<
	typeof CreateApplicationSchema
>;

export type ApplicationResponseDto = {
	id: number;
	jobRoleId: number;
	status: ApplicationStatus;
	createdAt: Date;
};
