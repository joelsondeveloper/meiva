"use client"; // Error boundaries precisam ser Client Components.

import Link from "next/link";
import { useEffect } from "react";

export default function Erro({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-4 py-8">
      <title>Algo deu errado · MEIva</title>
      <h1 className="text-3xl font-bold">Algo deu errado</h1>
      <p className="text-lg">
        Não foi culpa sua. Os lançamentos já salvos continuam guardados. Tente de novo.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-2 min-h-12 rounded-xl bg-primaria px-6 text-lg font-semibold text-sobre-primaria hover:bg-primaria-forte"
      >
        Tentar de novo
      </button>
      <Link
        href="/"
        className="flex min-h-12 items-center justify-center rounded-xl border-2 border-borda-forte px-6 text-lg font-semibold"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
