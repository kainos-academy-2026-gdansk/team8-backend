import express, { Router } from "express";
import { ApplicationController } from "../../../../src/controllers/applicationController";
import {
	type ApplicationDao,
	DuplicateApplicationError,
} from "../../../../src/dao/applicationDao";
import type { JobRoleDao } from "../../../../src/dao/jobRoleDao";
import { validateIdParam } from "../../../../src/middleware/jobRoleRequestParsers";
import { requireAuth } from "../../../../src/middleware/requireAuth";
import { Application } from "../../../../src/models/Application";
import { Band } from "../../../../src/models/Band";
import { Capability } from "../../../../src/models/Capability";
import { JobRole } from "../../../../src/models/JobRole";
import { Status } from "../../../../src/models/Status";
import { ApplicationService } from "../../../../src/services/applicationService";
import type { JobRoleSeed, ScenarioState } from "./scenarioState";

const state: ScenarioState = { userIds: [], jobRoles: [], applications: [] };
let nextApplicationId = 1;

function toJobRole(seed: JobRoleSeed): JobRole {
	const capability = new Capability(1, "Engineering");
	const band = new Band(2, "B2");
	const status = new Status(1, seed.statusName);

	return new JobRole(
		seed.id,
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
		seed.numberOfOpenPositions,
	);
}

const jobRoleDao: Pick<JobRoleDao, "getById"> = {
	async getById(id) {
		const seed = state.jobRoles.find((role) => role.id === id);
		return seed ? toJobRole(seed) : null;
	},
};

const applicationDao: ApplicationDao = {
	async getByUserAndJobRole(userId, jobRoleId) {
		const seed = state.applications.find(
			(application) =>
				application.userId === userId && application.jobRoleId === jobRoleId,
		);

		return seed
			? new Application(
					1,
					userId,
					jobRoleId,
					"existing-cv",
					"IN_PROGRESS",
					new Date(),
				)
			: null;
	},
	async create(userId, jobRoleId, cv) {
		if (state.failOnCreate === "duplicate") {
			throw new DuplicateApplicationError();
		}
		if (state.failOnCreate === "unexpected") {
			throw new Error("database unavailable");
		}

		state.applications.push({ userId, jobRoleId });
		return new Application(
			nextApplicationId++,
			userId,
			jobRoleId,
			cv,
			"IN_PROGRESS",
			new Date("2026-08-17T00:00:00.000Z"),
		);
	},
};

const controller = new ApplicationController(
	new ApplicationService(applicationDao, jobRoleDao as JobRoleDao),
);

const jobRoleRouter = Router();
jobRoleRouter.post(
	"/:id/applications",
	(req, res, next) => validateIdParam(req, res, next, "id", "jobRoleId"),
	(req, res) => controller.create(req, res),
);

export function createTestServer() {
	const testApp = express();
	testApp.use(express.json());

	testApp.get("/health", (_req, res) => {
		res.json({ status: "OK" });
	});

	// Test-only control endpoint used by BDD Given steps to seed scenario state.
	testApp.put("/__test__/state", (req, res) => {
		const body = req.body as ScenarioState;
		state.userIds = body.userIds ?? [];
		state.jobRoles = body.jobRoles ?? [];
		state.applications = body.applications ?? [];
		state.failOnCreate = body.failOnCreate;
		nextApplicationId = 1;
		res.status(204).end();
	});

	testApp.get("/__test__/applications", (_req, res) => {
		res.json(
			state.applications.map((application) => ({
				...application,
				status: "IN_PROGRESS",
			})),
		);
	});

	testApp.use(requireAuth);
	testApp.use("/api/job-roles", jobRoleRouter);

	return testApp;
}

const port = Number(process.env.BDD_PORT ?? 4010);
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "bdd-test-secret";
createTestServer().listen(port, () => {
	console.log(`BDD test server listening on http://127.0.0.1:${port}`);
});
