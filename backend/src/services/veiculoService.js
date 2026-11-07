import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/AppError.js";

const anoMaximo = new Date().getFullYear() + 1;

const veiculoSchema = z.object({
  marca: z.string().trim().min(1, "Marca é obrigatória").max(80),
  modelo: z.string().trim().min(1, "Modelo é obrigatório").max(80),
  placa: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{7,8}$/, "Placa inválida"),
  ano: z.coerce.number().int("Ano deve ser inteiro").min(1950, "Ano inválido").max(anoMaximo, "Ano inválido"),
  valorDiaria: z.coerce.number("Valor da diária inválido").positive("Valor da diária deve ser positivo").max(99999999),
});

const filtroSchema = z.object({
  disponivel: z.enum(["true", "false"]).optional(),
});

export async function cadastrar(corpo) {
  const dados = veiculoSchema.parse(corpo);

  const existente = await prisma.veiculo.findUnique({ where: { placa: dados.placa } });
  if (existente) {
    throw new AppError(409, "Já existe um veículo com essa placa");
  }

  try {
    return await prisma.veiculo.create({ data: dados });
  } catch (erro) {
    if (erro.code === "P2002") {
      throw new AppError(409, "Já existe um veículo com essa placa");
    }
    throw erro;
  }
}

export async function listar(query) {
  const filtro = filtroSchema.parse({ disponivel: query.disponivel });

  const where = {};
  if (filtro.disponivel !== undefined) {
    where.disponivel = filtro.disponivel === "true";
  }

  return prisma.veiculo.findMany({
    where,
    orderBy: [{ marca: "asc" }, { modelo: "asc" }],
  });
}
