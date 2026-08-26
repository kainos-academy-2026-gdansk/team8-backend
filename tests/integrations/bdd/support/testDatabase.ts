export const TEST_DATABASE_URL =
	process.env.TEST_DATABASE_URL ??
	"postgresql://postgres:postgres@127.0.0.1:5433/team8_backend_test";

// The integration harness truncates every table, so refuse to run against anything but a test database.
export function assertTestDatabase(url = process.env.DATABASE_URL): void {
	if (!url) {
		throw new Error("DATABASE_URL is not set for the integration harness");
	}

	const databaseName = new URL(url).pathname.replace(/^\//, "");
	if (!databaseName.endsWith("_test")) {
		throw new Error(
			`Refusing to start: the integration harness truncates all tables and requires a database whose name ends with "_test", but DATABASE_URL points at "${databaseName}".`,
		);
	}
}
