import express, { Router } from "express";
import { ApplicationController } from "../../../src/controllers/applicationController";
import { ApplicationDaoImpl } from "../../../src/dao/applicationDaoImpl";
import { JobRoleDaoImpl } from "../../../src/dao/jobRoleDaoImpl";
import { validateJobRoleIdParam } from "../../../src/middleware/jobRoleRequestParsers";
import { requireAuth } from "../../../src/middleware/requireAuth";
import prisma from "../../../src/prismaClient";
import { ApplicationService } from "../../../src/services/applicationService";
import type { ScenarioState } from "./scenarioState";
import { assertTestDatabase } from "./testDatabase";

assertTestDatabase();

const controller = new ApplicationController(
	new ApplicationService(new ApplicationDaoImpl(), new JobRoleDaoImpl()),
);

const jobRoleRouter = Router();
jobRoleRouter.post("/:id/applications", validateJobRoleIdParam, (req, res) =>
	controller.create(req, res),
);

async function resetAndSeed(state: ScenarioState): Promise<void> {
	await prisma.$executeRawUnsafe(
		'TRUNCATE TABLE "Application", "JobRole", "User", "Status", "Capability", "Band" RESTART IDENTITY CASCADE',
	);

	const capability = await prisma.capability.create({
		data: { name: "Engineering" },
	});
	const band = await prisma.band.create({ data: { name: "B2" } });

	for (const userId of state.userIds ?? []) {
		await prisma.user.create({
			data: {
				id: userId,
				email: `user${userId}@kainos.com`,
				passwordHash: "not-used-by-these-tests",
			},
		});
	}

	const statusIds = new Map<string, number>();
	for (const jobRole of state.jobRoles ?? []) {
		let statusId = statusIds.get(jobRole.statusName);
		if (statusId === undefined) {
			const status = await prisma.status.create({
				data: { name: jobRole.statusName },
			});
			statusId = status.id;
			statusIds.set(jobRole.statusName, statusId);
		}

		await prisma.jobRole.create({
			data: {
				id: jobRole.id,
				roleName: "Software Engineer",
				description: "Role description",
				responsibilities: "Build APIs",
				sharepointUrl:
					"https://company.sharepoint.com/sites/job-specs/software-engineer",
				location: "Gdansk",
				capabilityId: capability.id,
				bandId: band.id,
				closingDate: new Date("2026-12-31T00:00:00.000Z"),
				statusId,
				numberOfOpenPositions: jobRole.numberOfOpenPositions,
			},
		});
	}

	for (const application of state.applications ?? []) {
		await prisma.application.create({
			data: {
				userId: application.userId,
				jobRoleId: application.jobRoleId,
				cv: "existing-cv",
			},
		});
	}
}

export function createIntegrationServer() {
	const testApp = express();
	testApp.use(express.json());

	testApp.get("/health", async (_req, res) => {
		await prisma.$queryRaw`SELECT 1`;
		res.json({ status: "OK" });
	});

	// Test-only control endpoint used by BDD Given steps to seed the real database.
	testApp.put("/__test__/state", async (req, res) => {
		try {
			await resetAndSeed(req.body as ScenarioState);
			res.status(204).end();
		} catch (error) {
			res.status(500).json({ error: String(error) });
		}
	});

	testApp.get("/__test__/applications", async (_req, res) => {
		const applications = await prisma.application.findMany({
			select: { userId: true, jobRoleId: true, status: true },
			orderBy: { id: "asc" },
		});
		res.json(applications);
	});

	testApp.use(requireAuth);
	testApp.use("/api/job-roles", jobRoleRouter);

	return testApp;
}

const port = Number(process.env.BDD_PORT ?? 4011);
createIntegrationServer().listen(port, () => {
	console.log(`BDD integration server listening on http://127.0.0.1:${port}`);
});
