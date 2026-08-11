import { describe, expect, it, vi } from "vitest";
import type { JobRoleDao } from "../../src/dao/jobRoleDao";
import { JobRole } from "../../src/models/JobRole";
import { Band } from "../../src/models/Band";
import { Capability } from "../../src/models/Capability";
import { JobRoleService } from "../../src/services/jobRoleService";

describe("JobRoleService", () => {
	it("maps DAO result to JobRoleResponse list", async () => {
		const capability = new Capability(1, "Engineering");
		const band = new Band(2, "B2");
		const closingDate = new Date("2026-12-31T00:00:00.000Z");
		const daoResult = [
			new JobRole(
				1,
				"Software Engineer",
				"Gdansk",
				capability,
				capability.id,
				band,
				band.id,
				closingDate,
				"OPEN",
			),
		];

		const dao = {
			getAll: vi.fn().mockResolvedValue(daoResult),
		} as unknown as JobRoleDao;

		const service = new JobRoleService(dao);
		const result = await service.getAll();

		expect(dao.getAll).toHaveBeenCalledTimes(1);
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			id: 1,
			roleName: "Software Engineer",
			location: "Gdansk",
			capability,
			band,
			closingDate,
			status: "OPEN",
		});
	});

	it("throws when DAO fails", async () => {
		const dao = {
			getAll: vi.fn().mockRejectedValue(new Error("Database error")),
		} as unknown as JobRoleDao;

		const service = new JobRoleService(dao);

		await expect(service.getAll()).rejects.toThrow("Database error");
		expect(dao.getAll).toHaveBeenCalledTimes(1);
	});
});
