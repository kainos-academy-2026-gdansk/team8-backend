import { execFileSync } from "node:child_process";

export default function globalTeardown(): void {
	// Set BDD_KEEP_DB=1 to keep the container running for faster reruns or debugging.
	if (process.env.BDD_KEEP_DB === "1" || process.env.BDD_EXTERNAL_DB === "1") {
		return;
	}

	execFileSync(
		"docker",
		["compose", "-f", "docker-compose.test.yml", "down", "-v"],
		{ stdio: "inherit" },
	);
}
