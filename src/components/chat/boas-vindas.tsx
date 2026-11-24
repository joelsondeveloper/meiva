export const EXEMPLOS = [
  "vendi 3 blusas a 50 no pix",
  "paguei 120 de fornecedor",
  "a Marta levou 2 blusas fiado",
] as const;

/** Tela inicial da conversa vazia. Tocar num exemplo só preenche o campo (não envia). */
export function BoasVindas({ onEscolher }: { onEscolher: (frase: string) => void }) {
  return (
    <section aria-labelledby="boas-vindas-titulo" className="flex flex-col gap-4 py-4">
      <h2 id="boas-vindas-titulo" className="text-2xl font-bold">
        Olá! O que aconteceu no caixa hoje?
      </h2>
      <p className="text-lg">
        Escreva do seu jeito, como numa conversa. Eu anoto as vendas e os gastos para você.
      </p>
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-texto-suave">Toque num exemplo para começar:</p>
        <ul className="flex flex-col gap-3">
          {EXEMPLOS.map((frase) => (
            <li key={frase}>
              <button
                type="button"
                onClick={() => onEscolher(frase)}
                className="min-h-12 w-full rounded-xl border border-borda-forte bg-superficie px-4 py-3 text-left text-lg hover:bg-fundo"
              >
                “{frase}”
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
