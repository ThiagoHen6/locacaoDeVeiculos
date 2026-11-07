import * as locacaoService from "../services/locacaoService.js";

export async function criar(req, res) {
  const locacao = await locacaoService.criar(req.usuarioId, req.body);
  res.status(201).json(locacao);
}

export async function listar(req, res) {
  const locacoes = await locacaoService.listarDoUsuario(req.usuarioId);
  res.status(200).json(locacoes);
}

export async function finalizar(req, res) {
  const locacao = await locacaoService.finalizar(req.usuarioId, req.params.id);
  res.status(200).json(locacao);
}
