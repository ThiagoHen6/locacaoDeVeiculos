import { useState } from "react";
import { api } from "../api.js";
import { dataHora, moeda } from "../format.js";

export default function LocacaoList({ locacoes, carregando, aoFinalizar, aoMensagem }) {
  const [finalizandoId, setFinalizandoId] = useState(null);

  async function finalizar(id) {
    setFinalizandoId(id);

    try {
      await api.finalizarLocacao(id);
      aoMensagem({ tipo: "sucesso", texto: "Locação finalizada. Veículo disponível novamente." });
    } catch (erro) {
      aoMensagem({ tipo: "erro", texto: erro.message });
    } finally {
      setFinalizandoId(null);
      aoFinalizar();
    }
  }

  return (
    <section className="cartao">
      <h2>Minhas locações</h2>

      {carregando ? (
        <p className="vazio">Carregando...</p>
      ) : locacoes.length === 0 ? (
        <p className="vazio">Você ainda não possui locações.</p>
      ) : (
        <div className="tabela-rolagem">
          <table>
            <thead>
              <tr>
                <th>Veículo</th>
                <th>Início</th>
                <th>Prevista</th>
                <th>Devolvido em</th>
                <th>Valor</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {locacoes.map((l) => (
                <tr key={l.id}>
                  <td>
                    {l.veiculo.marca} {l.veiculo.modelo}
                    <small>{l.veiculo.placa}</small>
                  </td>
                  <td>{dataHora(l.dataInicio)}</td>
                  <td>{dataHora(l.dataPrevistaDevolucao)}</td>
                  <td>{dataHora(l.dataDevolucao)}</td>
                  <td>{moeda(l.valorTotal)}</td>
                  <td>
                    <span className={`etiqueta ${l.status === "ATIVA" ? "ocupado" : "ok"}`}>
                      {l.status === "ATIVA" ? "Ativa" : "Finalizada"}
                    </span>
                  </td>
                  <td>
                    {l.status === "ATIVA" && (
                      <button
                        type="button"
                        className="secundario"
                        disabled={finalizandoId === l.id}
                        onClick={() => finalizar(l.id)}
                      >
                        {finalizandoId === l.id ? "Finalizando..." : "Finalizar"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
