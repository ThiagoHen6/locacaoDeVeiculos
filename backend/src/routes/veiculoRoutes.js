import { Router } from "express";
import * as veiculoController from "../controllers/veiculoController.js";
import { autenticar } from "../middlewares/auth.js";

const router = Router();

router.use(autenticar);
router.post("/", veiculoController.cadastrar);
router.get("/", veiculoController.listar);

export default router;
