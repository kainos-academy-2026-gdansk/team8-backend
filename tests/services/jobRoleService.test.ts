import { describe, expect, it, vi } from "vitest";
import type { JobRoleDao } from "../../src/dao/jobRoleDao";
import { JobRole } from "../../src/models/JobRole";
import { Band } from "../../src/models/Band";
import { Capability } from "../../src/models/Capability";
import { Status } from "../../src/models/Status";
import { JobRoleService } from "../../src/services/jobRoleService";

function createJobRole(): JobRole {
	const capability = new Capability(1, "Engineering");
	const band = new Band(2, "B2");
	const status = new Status(1, "OPEN");

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
		2,
	);
}

describe("JobRoleService", () => {
	it("maps DAO paginated result to response list with metadata", async () => {
		const daoResult = [createJobRole()];

		const dao = {
			getAll: vi.fn().mockResolvedValue(daoResult),
			countAll: vi.fn().mockResolvedValue(25),
		} as unknown as JobRoleDao;

		const service = new JobRoleService(dao);
		const result = await service.getAll({ limit: 10, offset: 10 });

		expect(dao.getAll).toHaveBeenCalledWith(10, 10);
		expect(dao.countAll).toHaveBeenCalledTimes(1);
		expect(result).toEqual({
			data: [
				{
			id: 1,
			roleName: "Software Engineer",
			location: "Gdansk",
			capability: { id: 1, name: "Engineering" },
			band: { id: 2, name: "B2" },
			closingDate: new Date("2026-12-31T00:00:00.000Z"),
			status: { id: 1, name: "OPEN" },
				},
			],
			total: 25,
			limit: 10,
			offset: 10,
			hasPrevious: true,
			hasNext: true,
			lastOffset: 20,
		});
	});

	it("maps DAO result to JobRoleDetailedResponse for getById", async () => {
		const daoResult = createJobRole();

		const dao = {
			getById: vi.fn().mockResolvedValue(daoResult),
		} as unknown as JobRoleDao;

		const service = new JobRoleService(dao);
		const result = await service.getById(1);

		expect(dao.getById).toHaveBeenCalledWith(1);
		expect(result).toEqual({
			id: 1,
			roleName: "Software Engineer",
			description: "Role description",
			responsibilities: "Build APIs",
			sharepointUrl:
				"https://company.sharepoint.com/sites/job-specs/software-engineer",
			location: "Gdansk",
			capability: { id: 1, name: "Engineering" },
			band: { id: 2, name: "B2" },
			closingDate: new Date("2026-12-31T00:00:00.000Z"),
			status: { id: 1, name: "OPEN" },
			numberOfOpenPositions: 2,
		});
	});

	it("returns null when DAO getById returns null", async () => {
		const dao = {
			getById: vi.fn().mockResolvedValue(null),
		} as unknown as JobRoleDao;

		const service = new JobRoleService(dao);
		const result = await service.getById(999);

		expect(dao.getById).toHaveBeenCalledWith(999);
		expect(result).toBeNull();
	});

	it("throws when DAO fails", async () => {
		const dao = {
			getAll: vi.fn().mockRejectedValue(new Error("Database error")),
			countAll: vi.fn().mockResolvedValue(0),
		} as unknown as JobRoleDao;

		const service = new JobRoleService(dao);

		await expect(service.getAll({ limit: 10, offset: 0 })).rejects.toThrow(
			"Database error",
		);
		expect(dao.getAll).toHaveBeenCalledWith(10, 0);
	});

	it("throws when DAO getById fails", async () => {
		const dao = {
			getById: vi.fn().mockRejectedValue(new Error("Database error")),
		} as unknown as JobRoleDao;

		const service = new JobRoleService(dao);

		await expect(service.getById(1)).rejects.toThrow("Database error");
		expect(dao.getById).toHaveBeenCalledWith(1);
	});
});
