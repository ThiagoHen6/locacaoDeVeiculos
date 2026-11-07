import { ZodError } from "zod";
import { AppError } from "../lib/AppError.js";

export function naoEncontrado(req, res) {
  res.status(404).json({ erro: "Rota não encontrada" });
}

export function tratarErros(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      erro: "Dados inválidos",
      detalhes: err.issues.map((issue) => ({
        campo: issue.path.join("."),
        mensagem: issue.message,
      })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ erro: err.message, detalhes: err.details });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido no corpo da requisição" });
  }

  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor" });
}
