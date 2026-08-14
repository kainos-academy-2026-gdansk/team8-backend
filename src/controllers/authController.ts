import type { Request, Response } from "express";
import { LoginSchema, RegisterSchema } from "../dtos/UserDto";
import Logger from "../lib/logger";
import { AuthError } from "../services/authService";
import type { AuthService } from "../services/authService";

export class AuthController {
	constructor(private readonly authService: AuthService) {}

	async register(req: Request, res: Response): Promise<void> {
		try {
			const parsed = RegisterSchema.safeParse(req.body);
			if (!parsed.success) {
				res.status(400).json({ error: "Invalid request body" });
				return;
			}
			const user = await this.authService.register(parsed.data);
			Logger.debug(`User registered successfully`);
			res.status(201).json(user);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "Email already exists") {
					Logger.debug(
						`Email already exists during registration: ${String(error)}`,
					);
					res.status(409).json({ error: error.message });
					return;
				}
			}

			Logger.error(`Failed to register user: ${String(error)}`);
			res.status(500).json({ error: "Failed to register user" });
		}
	}

	async login(req: Request, res: Response): Promise<void> {
		try {
			const parsed = LoginSchema.safeParse(req.body);
			if (!parsed.success) {
				res.status(400).json({ error: "Invalid request body" });
				return;
			}
			const token = await this.authService.login(parsed.data);
			Logger.debug(`User logged in successfully`);
			res.status(200).json({ token });
		} catch (error) {
			if (error instanceof AuthError) {
				res.status(error.statusCode).json({ error: error.message });
				return;
			}

			Logger.error(`Failed to login user: ${String(error)}`);
			res.status(500).json({ error: "Failed to login user" });
		}
	}
}
