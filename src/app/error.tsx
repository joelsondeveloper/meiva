"use client"; // Error boundaries precisam ser Client Components.

import { useEffect } from "react";
import { BotaoSecundario, Pagina } from "@/components/pagina";

export default function Erro({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Pagina titulo="Esta página não abriu" descricao="O que você já anotou continua guardado.">
      <title>Esta página não abriu · MEIva</title>
      <section className="flex flex-col items-start gap-4 rounded-bloco border border-borda bg-superficie p-6 sm:p-8">
        <p className="max-w-prose text-lg">
          Pode ser a internet ou o servidor. Confira a conexão e tente de novo. Se continuar, volte
          para a Conversa e tente daqui a pouco.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex min-h-14 items-center justify-center rounded-controle bg-acento px-6 text-lg font-bold text-sobre-acento hover:bg-acento-forte"
          >
            Tentar de novo
          </button>
          <BotaoSecundario href="/">Ir para a Conversa</BotaoSecundario>
        </div>
      </section>
    </Pagina>
  );
}
