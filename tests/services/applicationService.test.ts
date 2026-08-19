import { describe, expect, it, vi } from "vitest";
import type { ApplicationDao } from "../../src/dao/applicationDao";
import type { JobRoleDao } from "../../src/dao/jobRoleDao";
import { Application } from "../../src/models/Application";
import { Band } from "../../src/models/Band";
import { Capability } from "../../src/models/Capability";
import { JobRole } from "../../src/models/JobRole";
import { Status } from "../../src/models/Status";
import {
	ApplicationError,
	ApplicationService,
} from "../../src/services/applicationService";

function createJobRole(statusName = "OPEN", openPositions = 2): JobRole {
	const capability = new Capability(1, "Engineering");
	const band = new Band(2, "B2");
	const status = new Status(1, statusName);

	return new JobRole(
		1,
		"Software Engineer",
		"Role description",
		"Build APIs",
		"https://company.sharepoint.com/sites/job-specs/software-engineer",
		"Gdansk",
		capability,
		capability.id,
		band,
		band.id,
		new Date("2026-12-31T00:00:00.000Z"),
		status,
		status.id,
		openPositions,
	);
}

function createApplication(): Application {
	return new Application(
		1,
		10,
		1,
		"encoded-cv",
		"IN_PROGRESS",
		new Date("2026-08-17T00:00:00.000Z"),
	);
}

describe("ApplicationService", () => {
	it("lists applications for the admin job-role detail view", async () => {
		const applicationDao = {
			getByJobRole: vi.fn().mockResolvedValue([
				{
					id: 1,
					jobRoleId: 1,
					applicantEmail: "applicant@example.com",
					cv: "encoded-cv",
					status: "IN_PROGRESS",
					createdAt: new Date("2026-08-17T00:00:00.000Z"),
				},
			]),
		} as unknown as ApplicationDao;
		const jobRoleDao = {
			getById: vi.fn().mockResolvedValue(createJobRole()),
		} as unknown as JobRoleDao;

		await expect(new ApplicationService(applicationDao, jobRoleDao).getApplicationsByJobRole(1)).resolves.toEqual([
			{
				id: 1,
				jobRoleId: 1,
				applicantEmail: "applicant@example.com",
				cv: "encoded-cv",
				status: "IN_PROGRESS",
				createdAt: new Date("2026-08-17T00:00:00.000Z"),
			},
		]);
	});

	it("creates an in-progress application for an eligible role", async () => {
		const applicationDao = {
			getByUserAndJobRole: vi.fn().mockResolvedValue(null),
			create: vi.fn().mockResolvedValue(createApplication()),
		} as unknown as ApplicationDao;
		const jobRoleDao = {
			getById: vi.fn().mockResolvedValue(createJobRole()),
		} as unknown as JobRoleDao;

		const result = await new ApplicationService(
			applicationDao,
			jobRoleDao,
		).createApplication(10, 1, { cv: "encoded-cv" });

		expect(applicationDao.create).toHaveBeenCalledWith(10, 1, "encoded-cv");
		expect(result).toEqual({
			id: 1,
			jobRoleId: 1,
			status: "IN_PROGRESS",
			createdAt: new Date("2026-08-17T00:00:00.000Z"),
		});
	});

	it("hiring an in-progress application decrements positions and marks the application as hired", async () => {
		const applicationDao = {
			hire: vi.fn().mockResolvedValue(
				new Application(
					1,
					10,
					1,
					"encoded-cv",
					"HIRED",
					new Date("2026-08-17T00:00:00.000Z"),
				),
			),
		} as unknown as ApplicationDao;
		const jobRoleDao = {
			getById: vi.fn().mockResolvedValue(createJobRole("OPEN", 2)),
		} as unknown as JobRoleDao;

		await expect(
			new ApplicationService(applicationDao, jobRoleDao).hire(1, 1),
		).resolves.toEqual({
			id: 1,
			jobRoleId: 1,
			status: "HIRED",
			createdAt: new Date("2026-08-17T00:00:00.000Z"),
		});
	});

	it("rejecting an in-progress application marks it rejected without changing the role", async () => {
		const applicationDao = {
			reject: vi.fn().mockResolvedValue(
				new Application(
					1,
					10,
					1,
					"encoded-cv",
					"REJECTED",
					new Date("2026-08-17T00:00:00.000Z"),
				),
			),
		} as unknown as ApplicationDao;
		const jobRoleDao = {
			getById: vi.fn().mockResolvedValue(createJobRole("OPEN", 2)),
		} as unknown as JobRoleDao;

		await expect(
			new ApplicationService(applicationDao, jobRoleDao).reject(1, 1),
		).resolves.toEqual({
			id: 1,
			jobRoleId: 1,
			status: "REJECTED",
			createdAt: new Date("2026-08-17T00:00:00.000Z"),
		});
	});

	it.each([
		["CLOSED", 2],
		["OPEN", 0],
	])(
		"rejects an ineligible role (%s, %s positions)",
		async (status, positions) => {
			const applicationDao = {
				getByUserAndJobRole: vi.fn(),
				create: vi.fn(),
			} as unknown as ApplicationDao;
			const jobRoleDao = {
				getById: vi.fn().mockResolvedValue(createJobRole(status, positions)),
			} as unknown as JobRoleDao;

			await expect(
				new ApplicationService(applicationDao, jobRoleDao).createApplication(
					10,
					1,
					{ cv: "encoded-cv" },
				),
			).rejects.toEqual(
				new ApplicationError("Job role is not available for applications", 423),
			);
			expect(applicationDao.create).not.toHaveBeenCalled();
		},
	);

	it("rejects a duplicate application", async () => {
		const applicationDao = {
			getByUserAndJobRole: vi.fn().mockResolvedValue(createApplication()),
			create: vi.fn(),
		} as unknown as ApplicationDao;
		const jobRoleDao = {
			getById: vi.fn().mockResolvedValue(createJobRole()),
		} as unknown as JobRoleDao;

		await expect(
			new ApplicationService(applicationDao, jobRoleDao).createApplication(
				10,
				1,
				{ cv: "encoded-cv" },
			),
		).rejects.toEqual(
			new ApplicationError("Application already exists for this job role", 409),
		);
	});
});
