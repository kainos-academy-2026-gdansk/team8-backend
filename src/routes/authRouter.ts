import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { UserDaoImpl } from "../dao/userDaoImpl";
import { AuthService } from "../services/authService";


const router = Router();
const controller = new AuthController(new AuthService(new UserDaoImpl()));

router.post("/register", async (_req, res) => controller.register(_req, res));

export default router;