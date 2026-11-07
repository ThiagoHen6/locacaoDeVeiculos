import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { autenticar } from "../middlewares/auth.js";

const router = Router();

router.post("/register", authController.cadastrar);
router.post("/login", authController.login);
router.get("/me", autenticar, authController.perfil);

export default router;
