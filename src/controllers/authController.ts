import type { Request, Response } from "express";
import type { RegisterRequestDto } from "../dtos/UserDto";
import Logger from "../lib/logger";
import type { AuthService } from "../services/authService";


export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.authService.register(req.body as RegisterRequestDto);
      Logger.debug(`User registered successfully: ${JSON.stringify(user)}`);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Passwords do not match") {
          Logger.debug(`Password mismatch during registration: ${String(error)}`);
          res.status(400).json({ error: error.message });
          return;
        }

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