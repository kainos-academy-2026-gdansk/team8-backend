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
		const result = await service.getAll({
			pagination: { limit: 10, offset: 10 },
			filters: {},
		});

		expect(dao.getAll).toHaveBeenCalledWith({
			pagination: { limit: 10, offset: 10 },
		});
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
			filtered: false,
		});
	});

	it("bypasses pagination and returns all matching rows when filters are active", async () => {
		const daoResult = [createJobRole()];

		const dao = {
			getAll: vi.fn().mockResolvedValue(daoResult),
			countAll: vi.fn().mockResolvedValue(25),
		} as unknown as JobRoleDao;

		const service = new JobRoleService(dao);
		const result = await service.getAll({
			pagination: { limit: 10, offset: 10 },
			filters: { roleName: "engineer" },
		});

		expect(dao.getAll).toHaveBeenCalledWith({
			filters: { roleName: "engineer" },
		});
		expect(dao.countAll).not.toHaveBeenCalled();
		expect(result.filtered).toBe(true);
		expect(result.total).toBe(1);
		expect(result.data).toHaveLength(1);
		expect(result.limit).toBe(1);
		expect(result.offset).toBe(0);
		expect(result.hasPrevious).toBe(false);
		expect(result.hasNext).toBe(false);
		expect(result.lastOffset).toBe(0);
	});

	it("treats multi-value name filters as active and forwards them to the DAO", async () => {
		const dao = {
			getAll: vi.fn().mockResolvedValue([]),
			countAll: vi.fn().mockResolvedValue(0),
		} as unknown as JobRoleDao;

		const service = new JobRoleService(dao);
		const filters = {
			capabilities: ["Engineering", "Delivery"],
			bands: ["B2"],
			statuses: ["OPEN"],
			closingDateAfter: new Date("2026-01-01T00:00:00.000Z"),
			closingDateBefore: new Date("2026-12-31T00:00:00.000Z"),
		};
		const result = await service.getAll({
			pagination: { limit: 10, offset: 0 },
			filters,
		});

		expect(dao.getAll).toHaveBeenCalledWith({ filters });
		expect(dao.countAll).not.toHaveBeenCalled();
		expect(result.filtered).toBe(true);
		expect(result.total).toBe(0);
		expect(result.data).toEqual([]);
	});

	it("ignores empty name-filter arrays and keeps pagination behavior", async () => {
		const dao = {
			getAll: vi.fn().mockResolvedValue([]),
			countAll: vi.fn().mockResolvedValue(0),
		} as unknown as JobRoleDao;

		const service = new JobRoleService(dao);
		const result = await service.getAll({
			pagination: { limit: 10, offset: 0 },
			filters: { capabilities: [] },
		});

		expect(dao.getAll).toHaveBeenCalledWith({
			pagination: { limit: 10, offset: 0 },
		});
		expect(dao.countAll).toHaveBeenCalledTimes(1);
		expect(result.filtered).toBe(false);
	});

	it("forwards ordering without bypassing pagination", async () => {
		const dao = {
			getAll: vi.fn().mockResolvedValue([]),
			countAll: vi.fn().mockResolvedValue(0),
		} as unknown as JobRoleDao;
		const service = new JobRoleService(dao);

		await service.getAll({
			pagination: { limit: 10, offset: 10 },
			filters: {},
			ordering: { field: "roleName", direction: "desc" },
		});

		expect(dao.getAll).toHaveBeenCalledWith({
			pagination: { limit: 10, offset: 10 },
			ordering: { field: "roleName", direction: "desc" },
		});
		expect(dao.countAll).toHaveBeenCalledTimes(1);
	});

	it("forwards ordering when filters bypass pagination", async () => {
		const dao = {
			getAll: vi.fn().mockResolvedValue([]),
			countAll: vi.fn().mockResolvedValue(0),
		} as unknown as JobRoleDao;
		const service = new JobRoleService(dao);

		await service.getAll({
			pagination: { limit: 10, offset: 10 },
			filters: { location: "Gdansk" },
			ordering: { field: "capability", direction: "asc" },
		});

		expect(dao.getAll).toHaveBeenCalledWith({
			filters: { location: "Gdansk" },
			ordering: { field: "capability", direction: "asc" },
		});
		expect(dao.countAll).not.toHaveBeenCalled();
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

		await expect(
			service.getAll({ pagination: { limit: 10, offset: 0 }, filters: {} }),
		).rejects.toThrow("Database error");
		expect(dao.getAll).toHaveBeenCalledWith({
			pagination: { limit: 10, offset: 0 },
		});
	});

	it("throws when DAO getById fails", async () => {
		const dao = {
			getById: vi.fn().mockRejectedValue(new Error("Database error")),
		} as unknown as JobRoleDao;

		const service = new JobRoleService(dao);

		await expect(service.getById(1)).rejects.toThrow("Database error");
		expect(dao.getById).toHaveBeenCalledWith(1);
	});

	it("creates a job role with the resolved open status", async () => {
		const dao = {
			getCapabilityById: vi.fn().mockResolvedValue(true),
			getBandById: vi.fn().mockResolvedValue(true),
			getOpenStatusId: vi.fn().mockResolvedValue(7),
			create: vi.fn().mockResolvedValue(createJobRole()),
		} as unknown as JobRoleDao;
		const input = {
			roleName: "Software Engineer",
			description: "Role description",
			responsibilities: "Build APIs",
			sharepointUrl: "https://company.sharepoint.com/sites/job-specs/se",
			location: "Gdansk",
			closingDate: new Date("2026-12-31T00:00:00.000Z"),
			numberOfOpenPositions: 2,
			capabilityId: 1,
			bandId: 2,
		};

		const result = await new JobRoleService(dao).create(input);

		expect(dao.create).toHaveBeenCalledWith({ ...input, statusId: 7 });
		expect(result.status.name).toBe("OPEN");
	});

	it("rejects an unknown capability", async () => {
		const dao = {
			getCapabilityById: vi.fn().mockResolvedValue(false),
			getBandById: vi.fn().mockResolvedValue(true),
			getOpenStatusId: vi.fn().mockResolvedValue(7),
		} as unknown as JobRoleDao;

		await expect(new JobRoleService(dao).create({} as never)).rejects.toThrow(
			"Capability not found",
		);
	});
});
