import * as authService from "../services/authService.js";

export async function cadastrar(req, res) {
  const usuario = await authService.cadastrar(req.body);
  res.status(201).json(usuario);
}

export async function login(req, res) {
  const resultado = await authService.login(req.body);
  res.status(200).json(resultado);
}

export async function perfil(req, res) {
  const usuario = await authService.perfil(req.usuarioId);
  res.status(200).json(usuario);
}
