import { moeda } from "../format.js";

export default function VeiculoList({ veiculos, filtro, aoFiltrar, carregando }) {
  return (
    <section className="cartao">
      <div className="cabecalho-secao">
        <h2>Veículos</h2>
        <select value={filtro} onChange={(e) => aoFiltrar(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="true">Disponíveis</option>
          <option value="false">Indisponíveis</option>
        </select>
      </div>

      {carregando ? (
        <p className="vazio">Carregando...</p>
      ) : veiculos.length === 0 ? (
        <p className="vazio">Nenhum veículo encontrado.</p>
      ) : (
        <div className="tabela-rolagem">
          <table>
            <thead>
              <tr>
                <th>Veículo</th>
                <th>Placa</th>
                <th>Ano</th>
                <th>Diária</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map((v) => (
                <tr key={v.id}>
                  <td>
                    {v.marca} {v.modelo}
                  </td>
                  <td>{v.placa}</td>
                  <td>{v.ano}</td>
                  <td>{moeda(v.valorDiaria)}</td>
                  <td>
                    <span className={`etiqueta ${v.disponivel ? "ok" : "ocupado"}`}>
                      {v.disponivel ? "Disponível" : "Indisponível"}
                    </span>
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
