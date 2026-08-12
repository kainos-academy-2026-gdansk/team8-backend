import type { Request, Response } from "express";
import { RegisterSchema } from "../dtos/UserDto";
import Logger from "../lib/logger";
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
      Logger.debug(`User registered successfully: ${`email:${user.email}` + `, role:${user.role}`}`);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Email already exists") {
          Logger.debug(`Email already exists during registration: ${String(error)}`);
          res.status(409).json({ error: error.message });
          return;
        }
      }

      Logger.error(`Failed to register user: ${String(error)}`);
      res.status(500).json({ error: "Failed to register user" });
    }
  }
}