const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";
const CHAVE_TOKEN = "locadora_token";

export class ApiError extends Error {
  constructor(status, message, detalhes) {
    super(message);
    this.status = status;
    this.detalhes = detalhes;
  }
}

export function obterToken() {
  return localStorage.getItem(CHAVE_TOKEN);
}

export function salvarToken(token) {
  localStorage.setItem(CHAVE_TOKEN, token);
}

export function removerToken() {
  localStorage.removeItem(CHAVE_TOKEN);
}

async function requisitar(caminho, { metodo = "GET", corpo } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = obterToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor");
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const detalhes = dados?.detalhes?.map((d) => d.mensagem).filter(Boolean).join(". ");
    throw new ApiError(resposta.status, detalhes || dados?.erro || "Erro inesperado", dados?.detalhes);
  }

  return dados;
}

export const api = {
  cadastrar: (corpo) => requisitar("/auth/register", { metodo: "POST", corpo }),
  login: (corpo) => requisitar("/auth/login", { metodo: "POST", corpo }),
  perfil: () => requisitar("/auth/me"),
  listarVeiculos: (disponivel) =>
    requisitar(`/veiculos${disponivel === undefined ? "" : `?disponivel=${disponivel}`}`),
  cadastrarVeiculo: (corpo) => requisitar("/veiculos", { metodo: "POST", corpo }),
  listarLocacoes: () => requisitar("/locacoes"),
  criarLocacao: (corpo) => requisitar("/locacoes", { metodo: "POST", corpo }),
  finalizarLocacao: (id) => requisitar(`/locacoes/${id}/finalizar`, { metodo: "PATCH" }),
};
