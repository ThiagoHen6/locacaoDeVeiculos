import { Router } from "express";
import authRoutes from "./authRoutes.js";
import veiculoRoutes from "./veiculoRoutes.js";
import locacaoRoutes from "./locacaoRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/veiculos", veiculoRoutes);
router.use("/locacoes", locacaoRoutes);

export default router;
