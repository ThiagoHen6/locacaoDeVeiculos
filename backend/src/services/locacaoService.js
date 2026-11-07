import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/AppError.js";

const MS_POR_DIA = 24 * 60 * 60 * 1000;

const criarSchema = z.object({
  veiculoId: z.coerce.number("Veículo inválido").int().positive("Veículo inválido"),
  dataInicio: z.coerce.date("Data de início inválida").optional(),
  dataPrevistaDevolucao: z.coerce.date("Data prevista de devolução inválida"),
});

const idSchema = z.coerce.number("Identificador inválido").int().positive("Identificador inválido");

function calcularValorTotal(valorDiaria, inicio, fim) {
  const diarias = Math.max(1, Math.ceil((fim.getTime() - inicio.getTime()) / MS_POR_DIA));
  return Math.round(Number(valorDiaria) * diarias * 100) / 100;
}

export async function criar(usuarioId, corpo) {
  const dados = criarSchema.parse(corpo);
  const dataInicio = dados.dataInicio ?? new Date();

  if (dados.dataPrevistaDevolucao <= dataInicio) {
    throw new AppError(400, "A data prevista de devolução deve ser posterior à data de início");
  }

  return prisma.$transaction(async (tx) => {
    const veiculo = await tx.veiculo.findUnique({ where: { id: dados.veiculoId } });

    if (!veiculo) {
      throw new AppError(404, "Veículo não encontrado");
    }

    if (!veiculo.disponivel) {
      throw new AppError(409, "Veículo indisponível para locação");
    }

    const reserva = await tx.veiculo.updateMany({
      where: { id: veiculo.id, disponivel: true },
      data: { disponivel: false },
    });

    if (reserva.count === 0) {
      throw new AppError(409, "Veículo indisponível para locação");
    }

    const valorTotal = calcularValorTotal(veiculo.valorDiaria, dataInicio, dados.dataPrevistaDevolucao);

    return tx.locacao.create({
      data: {
        usuarioId,
        veiculoId: veiculo.id,
        dataInicio,
        dataPrevistaDevolucao: dados.dataPrevistaDevolucao,
        valorTotal,
      },
      include: { veiculo: true },
    });
  });
}

export async function listarDoUsuario(usuarioId) {
  return prisma.locacao.findMany({
    where: { usuarioId },
    include: { veiculo: true },
    orderBy: { dataInicio: "desc" },
  });
}

export async function finalizar(usuarioId, idParam) {
  const id = idSchema.parse(idParam);

  const locacao = await prisma.locacao.findUnique({ where: { id } });

  if (!locacao) {
    throw new AppError(404, "Locação não encontrada");
  }

  if (locacao.usuarioId !== usuarioId) {
    throw new AppError(403, "Você não tem permissão para finalizar esta locação");
  }

  if (locacao.status === "FINALIZADA") {
    throw new AppError(409, "Esta locação já foi finalizada");
  }

  return prisma.$transaction(async (tx) => {
    const encerramento = await tx.locacao.updateMany({
      where: { id, status: "ATIVA" },
      data: { status: "FINALIZADA", dataDevolucao: new Date() },
    });

    if (encerramento.count === 0) {
      throw new AppError(409, "Esta locação já foi finalizada");
    }

    await tx.veiculo.update({
      where: { id: locacao.veiculoId },
      data: { disponivel: true },
    });

    return tx.locacao.findUnique({ where: { id }, include: { veiculo: true } });
  });
}
