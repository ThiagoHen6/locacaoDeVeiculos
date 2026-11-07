import { Router } from "express";
import * as locacaoController from "../controllers/locacaoController.js";
import { autenticar } from "../middlewares/auth.js";

const router = Router();

router.use(autenticar);
router.post("/", locacaoController.criar);
router.get("/", locacaoController.listar);
router.patch("/:id/finalizar", locacaoController.finalizar);

export default router;
