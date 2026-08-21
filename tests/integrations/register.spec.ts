import "dotenv/config";
import { randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import { expect, request as playwrightRequest, test } from "@playwright/test";
import argon2 from "argon2";
import app from "../../src/app";
import prisma from "../../src/prismaClient";

const testEmail = `playwright-registration-${randomUUID()}@example.com`;
let server: Server | undefined;
let apiContext:
	| Awaited<ReturnType<typeof playwrightRequest.newContext>>
	| undefined;
let databaseConnected = false;

test.beforeAll(async () => {
	await prisma.$queryRaw`SELECT 1`;
	databaseConnected = true;
	const startedServer = createServer(app);
	server = startedServer;
	await new Promise<void>((resolve) => startedServer.listen(0, resolve));

	const address = server.address();
	if (!address || typeof address === "string") {
		throw new Error("Could not determine the integration test server port");
	}

	apiContext = await playwrightRequest.newContext({
		baseURL: `http://127.0.0.1:${address.port}`,
	});
});

test.afterAll(async () => {
  await apiContext?.dispose();
  if (server?.listening) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => (error ? reject(error) : resolve()));
    });
  }
  if (databaseConnected) {
    try {
      await prisma.user.deleteMany({ where: { email: testEmail } });
    } catch (error) {
      console.error("Cleanup error (non-fatal):", error);
    }
  }
  if (databaseConnected) {
    await prisma.$disconnect();
  }
});

test("registers a user and persists a hashed password", async () => {
	if (!apiContext) {
		throw new Error("Playwright API context was not initialized");
	}
	const password = "StrongPass!1";
	const response = await apiContext.post("/api/auth/register", {
		data: {
			email: testEmail,
			password,
			confirmPassword: password,
		},
	});

	expect(response.status()).toBe(201);
	expect(await response.json()).toEqual({
		email: testEmail,
		role: "USER",
	});

	const user = await prisma.user.findUnique({
		where: { email: testEmail },
		select: { email: true, role: true, passwordHash: true },
	});

	expect(user).not.toBeNull();
	if (!user) {
		return;
	}

	expect(user.email).toBe(testEmail);
	expect(user.role).toBe("USER");
	expect(user.passwordHash).not.toBe(password);
	expect(await argon2.verify(user.passwordHash, password)).toBe(true);
});
