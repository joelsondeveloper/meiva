"use client"; // Error boundaries precisam ser Client Components.

import "./globals.css";

/**
 * Erro no próprio layout raiz. Substitui o layout inteiro, por isso tem
 * <html lang="pt-BR"> e importa o CSS de novo. Sem Link (pode não haver router).
 */
export default function ErroGlobal({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="pt-BR">
      <body className="bg-fundo text-texto">
        <title>Algo deu errado · MEIva</title>
        <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-4 py-8">
          <h1 className="text-3xl font-bold">Algo deu errado</h1>
          <p className="text-lg">
            Não foi culpa sua. Os lançamentos já salvos continuam guardados. Tente de novo.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-2 min-h-14 rounded-2xl bg-acento px-6 text-lg font-bold text-sobre-acento hover:bg-acento-forte"
          >
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  );
}
