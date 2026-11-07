export default function Mensagem({ mensagem, aoFechar }) {
  if (!mensagem) return null;

  return (
    <div className={`mensagem ${mensagem.tipo}`} role="alert">
      <span>{mensagem.texto}</span>
      <button type="button" onClick={aoFechar} aria-label="Fechar">
        ×
      </button>
    </div>
  );
}
