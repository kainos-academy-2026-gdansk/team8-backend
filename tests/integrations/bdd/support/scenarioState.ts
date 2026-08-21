export type JobRoleSeed = {
	id: number;
	statusName: string;
	numberOfOpenPositions: number;
};

export type ApplicationSeed = {
	userId: number;
	jobRoleId: number;
};

export type ScenarioState = {
	userIds: number[];
	jobRoles: JobRoleSeed[];
	applications: ApplicationSeed[];
	/** Fault injection, supported by the mocked harness only. */
	failOnCreate?: "duplicate" | "unexpected";
};
