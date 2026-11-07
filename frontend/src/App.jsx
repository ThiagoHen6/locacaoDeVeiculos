import { useCallback, useEffect, useState } from "react";
import { api, ApiError, obterToken, removerToken } from "./api.js";
import AuthForm from "./components/AuthForm.jsx";
import Mensagem from "./components/Mensagem.jsx";
import VeiculoForm from "./components/VeiculoForm.jsx";
import VeiculoList from "./components/VeiculoList.jsx";
import LocacaoForm from "./components/LocacaoForm.jsx";
import LocacaoList from "./components/LocacaoList.jsx";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(Boolean(obterToken()));
  const [mensagem, setMensagem] = useState(null);
  const [veiculos, setVeiculos] = useState([]);
  const [veiculosDisponiveis, setVeiculosDisponiveis] = useState([]);
  const [locacoes, setLocacoes] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [carregando, setCarregando] = useState(false);

  const sair = useCallback(() => {
    removerToken();
    setUsuario(null);
    setVeiculos([]);
    setVeiculosDisponiveis([]);
    setLocacoes([]);
  }, []);

  const tratarErro = useCallback(
    (erro) => {
      if (erro instanceof ApiError && erro.status === 401) {
        sair();
        setMensagem({ tipo: "erro", texto: "Sessão expirada. Faça login novamente." });
      } else {
        setMensagem({ tipo: "erro", texto: erro.message });
      }
    },
    [sair]
  );

  useEffect(() => {
    if (!obterToken()) return;

    api
      .perfil()
      .then(setUsuario)
      .catch(() => removerToken())
      .finally(() => setVerificando(false));
  }, []);

  const carregarVeiculos = useCallback(async () => {
    try {
      const filtroApi = filtro === "todos" ? undefined : filtro;
      const [lista, disponiveis] = await Promise.all([
        api.listarVeiculos(filtroApi),
        api.listarVeiculos(true),
      ]);
      setVeiculos(lista);
      setVeiculosDisponiveis(disponiveis);
    } catch (erro) {
      tratarErro(erro);
    }
  }, [filtro, tratarErro]);

  const carregarLocacoes = useCallback(async () => {
    try {
      setLocacoes(await api.listarLocacoes());
    } catch (erro) {
      tratarErro(erro);
    }
  }, [tratarErro]);

  const atualizarTudo = useCallback(async () => {
    await Promise.all([carregarVeiculos(), carregarLocacoes()]);
  }, [carregarVeiculos, carregarLocacoes]);

  useEffect(() => {
    if (!usuario) return;
    setCarregando(true);
    atualizarTudo().finally(() => setCarregando(false));
  }, [usuario, atualizarTudo]);

  if (verificando) {
    return <p className="vazio">Verificando sessão...</p>;
  }

  return (
    <div className="container">
      <header className="topo">
        <h1>Locadora de Veículos</h1>
        {usuario && (
          <div className="usuario">
            <span>{usuario.nome}</span>
            <button type="button" className="secundario" onClick={sair}>
              Sair
            </button>
          </div>
        )}
      </header>

      <Mensagem mensagem={mensagem} aoFechar={() => setMensagem(null)} />

      {!usuario ? (
        <AuthForm aoAutenticar={setUsuario} aoMensagem={setMensagem} />
      ) : (
        <main>
          <LocacaoForm
            veiculosDisponiveis={veiculosDisponiveis}
            aoRegistrar={atualizarTudo}
            aoMensagem={setMensagem}
          />
          <LocacaoList
            locacoes={locacoes}
            carregando={carregando}
            aoFinalizar={atualizarTudo}
            aoMensagem={setMensagem}
          />
          <VeiculoForm aoCadastrar={carregarVeiculos} aoMensagem={setMensagem} />
          <VeiculoList
            veiculos={veiculos}
            filtro={filtro}
            aoFiltrar={setFiltro}
            carregando={carregando}
          />
        </main>
      )}
    </div>
  );
}
