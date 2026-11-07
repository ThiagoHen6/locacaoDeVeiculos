import { useState } from "react";
import { api, salvarToken } from "../api.js";

export default function AuthForm({ aoAutenticar, aoMensagem }) {
  const [modo, setModo] = useState("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);

    try {
      if (modo === "cadastro") {
        await api.cadastrar({ nome, email, senha });
        aoMensagem({ tipo: "sucesso", texto: "Cadastro realizado. Faça login para continuar." });
        setModo("login");
        setSenha("");
      } else {
        const { token, usuario } = await api.login({ email, senha });
        salvarToken(token);
        aoAutenticar(usuario);
        aoMensagem({ tipo: "sucesso", texto: `Bem-vindo, ${usuario.nome}!` });
      }
    } catch (erro) {
      aoMensagem({ tipo: "erro", texto: erro.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="cartao autenticacao">
      <h2>{modo === "login" ? "Entrar" : "Criar conta"}</h2>
      <form onSubmit={enviar}>
        {modo === "cadastro" && (
          <label>
            Nome
            <input value={nome} onChange={(e) => setNome(e.target.value)} required minLength={2} />
          </label>
        )}
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={6}
          />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? "Aguarde..." : modo === "login" ? "Entrar" : "Cadastrar"}
        </button>
      </form>
      <button
        type="button"
        className="link"
        onClick={() => setModo(modo === "login" ? "cadastro" : "login")}
      >
        {modo === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
      </button>
    </section>
  );
}
