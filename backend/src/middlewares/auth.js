import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/AppError.js";

export async function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho) {
    throw new AppError(401, "Token de autenticação não informado");
  }

  const [esquema, token] = cabecalho.split(" ");

  if (esquema !== "Bearer" || !token) {
    throw new AppError(401, "Formato do token inválido. Use: Bearer <token>");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError(401, "Token inválido ou expirado");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true },
  });

  if (!usuario) {
    throw new AppError(401, "Usuário do token não existe mais");
  }

  req.usuarioId = usuario.id;
  next();
}
