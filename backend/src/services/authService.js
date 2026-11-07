import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/AppError.js";

const cadastroSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(120),
  email: z.string().trim().toLowerCase().email("E-mail inválido").max(160),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres").max(72),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

const camposPublicos = { id: true, nome: true, email: true, criadoEm: true };

export async function cadastrar(corpo) {
  const dados = cadastroSchema.parse(corpo);

  const existente = await prisma.usuario.findUnique({ where: { email: dados.email } });
  if (existente) {
    throw new AppError(409, "E-mail já cadastrado");
  }

  const senhaHash = await bcrypt.hash(dados.senha, 10);

  try {
    return await prisma.usuario.create({
      data: { nome: dados.nome, email: dados.email, senhaHash },
      select: camposPublicos,
    });
  } catch (erro) {
    if (erro.code === "P2002") {
      throw new AppError(409, "E-mail já cadastrado");
    }
    throw erro;
  }
}

export async function login(corpo) {
  const dados = loginSchema.parse(corpo);

  const usuario = await prisma.usuario.findUnique({ where: { email: dados.email } });
  const senhaCorreta = usuario ? await bcrypt.compare(dados.senha, usuario.senhaHash) : false;

  if (!usuario || !senhaCorreta) {
    throw new AppError(401, "E-mail ou senha incorretos");
  }

  const token = jwt.sign({ sub: String(usuario.id) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      criadoEm: usuario.criadoEm,
    },
  };
}

export async function perfil(usuarioId) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: camposPublicos,
  });

  if (!usuario) {
    throw new AppError(404, "Usuário não encontrado");
  }

  return usuario;
}
