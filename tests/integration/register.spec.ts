import "dotenv/config";
import { randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import { request as playwrightRequest, test, expect } from "@playwright/test";
import argon2 from "argon2";
import app from "../../src/app";
import prisma from "../../src/prismaClient";

const testEmail = `playwright-registration-${randomUUID()}@example.com`;
let server: Server;
let apiContext: Awaited<ReturnType<typeof playwrightRequest.newContext>>;

test.beforeAll(async () => {
	await prisma.$queryRaw`SELECT 1`;
	server = createServer(app);
	await new Promise<void>((resolve) => server.listen(0, resolve));

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
	await new Promise<void>((resolve, reject) => {
		server.close((error) => (error ? reject(error) : resolve()));
	});
	await prisma.user.deleteMany({ where: { email: testEmail } });
	await prisma.$disconnect();
});

test("registers a user and persists a hashed password", async () => {
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