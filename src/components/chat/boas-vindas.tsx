import { TextoComNumeros } from "@/components/texto-com-numeros";

/** Frases de exemplo da conversa vazia: venda, gasto e recebimento. */
export const EXEMPLOS = ["Vendi 50 reais de pudim", "Paguei 30 de luz", "Fulano me pagou"] as const;

/** Conversa vazia. Tocar num exemplo só preenche o campo (dá para editar antes de enviar). */
export function BoasVindas({ onEscolher }: { onEscolher: (frase: string) => void }) {
  return (
    <section aria-labelledby="boas-vindas-titulo" className="flex flex-col gap-5 py-1">
      <div className="flex max-w-prose flex-col gap-1">
        <p className="text-lg">
          Escreva do seu jeito, como numa conversa. Eu anoto vendas, gastos, fiados e pagamentos.
        </p>
        <p className="text-texto-suave">Também pode falar: toque no microfone.</p>
      </div>
      <div className="flex flex-col gap-2">
        <h2 id="boas-vindas-titulo" className="text-lg font-bold">Experimente uma destas:</h2>
        <ul className="flex flex-col gap-2 sm:max-w-md">
          {EXEMPLOS.map((frase) => (
            <li key={frase}>
              <button
                type="button"
                onClick={() => onEscolher(frase)}
                className="flex min-h-12 w-full items-center rounded-controle border border-borda-forte bg-superficie px-4 py-2 text-left transition-[background-color,scale] duration-150 hover:bg-primaria-suave active:scale-[0.98]"
              >
                {/* span: num flex, os espaços em volta do número sumiriam. */}
                <span>“<TextoComNumeros>{frase}</TextoComNumeros>”</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
