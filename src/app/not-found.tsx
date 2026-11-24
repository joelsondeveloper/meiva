import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-4 py-8">
      <p className="text-lg font-semibold text-texto-suave">Erro 404</p>
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p className="text-lg">O endereço pode estar errado ou esta página não existe mais.</p>
      <Link
        href="/"
        className="mt-2 flex min-h-12 items-center justify-center rounded-xl bg-primaria px-6 text-lg font-semibold text-sobre-primaria hover:bg-primaria-forte"
      >
        Voltar para o caixa
      </Link>
    </main>
  );
}
