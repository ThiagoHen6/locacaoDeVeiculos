import { useEffect, useState } from "react";
import { api } from "../api.js";
import { moeda } from "../format.js";

const MS_POR_DIA = 24 * 60 * 60 * 1000;

function paraInputLocal(data) {
  const deslocamento = data.getTimezoneOffset() * 60000;
  return new Date(data.getTime() - deslocamento).toISOString().slice(0, 16);
}

export default function LocacaoForm({ veiculosDisponiveis, aoRegistrar, aoMensagem }) {
  const [veiculoId, setVeiculoId] = useState("");
  const [dataInicio, setDataInicio] = useState(() => paraInputLocal(new Date()));
  const [dataDevolucao, setDataDevolucao] = useState(() =>
    paraInputLocal(new Date(Date.now() + MS_POR_DIA))
  );
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (veiculoId && !veiculosDisponiveis.some((v) => String(v.id) === String(veiculoId))) {
      setVeiculoId("");
    }
  }, [veiculosDisponiveis, veiculoId]);

  const veiculoEscolhido = veiculosDisponiveis.find((v) => String(v.id) === String(veiculoId));
  const inicio = new Date(dataInicio);
  const fim = new Date(dataDevolucao);
  const periodoValido = !Number.isNaN(inicio.getTime()) && !Number.isNaN(fim.getTime()) && fim > inicio;
  const estimativa =
    veiculoEscolhido && periodoValido
      ? Number(veiculoEscolhido.valorDiaria) * Math.max(1, Math.ceil((fim - inicio) / MS_POR_DIA))
      : null;

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);

    try {
      const locacao = await api.criarLocacao({
        veiculoId: Number(veiculoId),
        dataInicio: inicio.toISOString(),
        dataPrevistaDevolucao: fim.toISOString(),
      });
      setVeiculoId("");
      aoMensagem({
        tipo: "sucesso",
        texto: `Locação registrada. Valor total: ${moeda(locacao.valorTotal)}.`,
      });
      aoRegistrar();
    } catch (erro) {
      aoMensagem({ tipo: "erro", texto: erro.message });
      aoRegistrar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="cartao">
      <h2>Nova locação</h2>
      <form onSubmit={enviar} className="grade">
        <label>
          Veículo
          <select value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)} required>
            <option value="">Selecione...</option>
            {veiculosDisponiveis.map((v) => (
              <option key={v.id} value={v.id}>
                {v.marca} {v.modelo} — {v.placa} ({moeda(v.valorDiaria)}/dia)
              </option>
            ))}
          </select>
        </label>
        <label>
          Início
          <input
            type="datetime-local"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            required
          />
        </label>
        <label>
          Devolução prevista
          <input
            type="datetime-local"
            value={dataDevolucao}
            onChange={(e) => setDataDevolucao(e.target.value)}
            required
          />
        </label>
        <div className="resumo">
          {estimativa !== null ? (
            <span>Estimativa: {moeda(estimativa)}</span>
          ) : (
            <span>Escolha o veículo e um período válido</span>
          )}
        </div>
        <button type="submit" disabled={enviando || !veiculoId || !periodoValido}>
          {enviando ? "Registrando..." : "Registrar locação"}
        </button>
      </form>
    </section>
  );
}
