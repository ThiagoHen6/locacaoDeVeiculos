import * as veiculoService from "../services/veiculoService.js";

export async function cadastrar(req, res) {
  const veiculo = await veiculoService.cadastrar(req.body);
  res.status(201).json(veiculo);
}

export async function listar(req, res) {
  const veiculos = await veiculoService.listar(req.query);
  res.status(200).json(veiculos);
}
