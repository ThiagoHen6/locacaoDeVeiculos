import { useState } from "react";
import { api } from "../api.js";

const inicial = { marca: "", modelo: "", placa: "", ano: "", valorDiaria: "" };

export default function VeiculoForm({ aoCadastrar, aoMensagem }) {
  const [campos, setCampos] = useState(inicial);
  const [enviando, setEnviando] = useState(false);

  function alterar(evento) {
    const { name, value } = evento.target;
    setCampos((anterior) => ({ ...anterior, [name]: value }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);

    try {
      await api.cadastrarVeiculo(campos);
      setCampos(inicial);
      aoMensagem({ tipo: "sucesso", texto: "Veículo cadastrado com sucesso." });
      aoCadastrar();
    } catch (erro) {
      aoMensagem({ tipo: "erro", texto: erro.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="cartao">
      <h2>Cadastrar veículo</h2>
      <form onSubmit={enviar} className="grade">
        <label>
          Marca
          <input name="marca" value={campos.marca} onChange={alterar} required />
        </label>
        <label>
          Modelo
          <input name="modelo" value={campos.modelo} onChange={alterar} required />
        </label>
        <label>
          Placa
          <input name="placa" value={campos.placa} onChange={alterar} required maxLength={8} />
        </label>
        <label>
          Ano
          <input name="ano" type="number" value={campos.ano} onChange={alterar} required />
        </label>
        <label>
          Valor da diária (R$)
          <input
            name="valorDiaria"
            type="number"
            step="0.01"
            min="0.01"
            value={campos.valorDiaria}
            onChange={alterar}
            required
          />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? "Salvando..." : "Cadastrar"}
        </button>
      </form>
    </section>
  );
}
