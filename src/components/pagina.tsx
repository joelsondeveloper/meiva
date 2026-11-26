import Link from "next/link";
import type { ReactNode } from "react";
import { Marca } from "@/components/marca";

/**
 * Moldura das páginas Resumo e Fiados: título grande, uma frase dizendo para
 * que a página serve e, opcionalmente, o botão principal da tela.
 * No celular, deixa espaço para a barra de abas.
 */
export function Pagina({
  titulo,
  descricao,
  acao,
  children,
}: {
  titulo: string;
  descricao: string;
  acao?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-[75rem] px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[calc(var(--altura-abas)+2rem)] sm:px-6 lg:px-10 lg:pt-10 lg:pb-12">
      <div className="flex min-h-12 items-center lg:hidden">
        <Marca />
      </div>
      <header className="flex flex-col gap-4 pt-3 pb-6 sm:flex-row sm:items-end sm:justify-between lg:pt-0 lg:pb-8">
        <div>
          <h1 className="text-3xl font-bold lg:text-4xl">{titulo}</h1>
          <p className="mt-1 text-lg text-texto-suave">{descricao}</p>
        </div>
        {acao}
      </header>
      {children}
    </main>
  );
}

const BOTAO = "inline-flex min-h-14 items-center justify-center gap-2 rounded-controle px-4 text-center text-lg font-bold sm:px-6";

/** Botão principal da tela (um só por tela): âmbar. */
export function BotaoPrincipal({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`${BOTAO} bg-acento text-sobre-acento transition-[background-color,scale] duration-150 hover:bg-acento-forte active:scale-[0.98]`}
    >
      {children}
    </Link>
  );
}

/** Ação secundária: contorno, sem cor de destaque. */
export function BotaoSecundario({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`${BOTAO} border border-borda-forte transition-[background-color,scale] duration-150 hover:bg-superficie active:scale-[0.98]`}
    >
      {children}
    </Link>
  );
}

/** Bloco de "carregando" com o formato aproximado do conteúdo (sem animação contínua). */
export function Carregando({ texto }: { texto: string }) {
  return (
    <div role="status" className="flex flex-col gap-4">
      <p className="text-texto-suave">{texto}</p>
      <div className="h-40 rounded-bloco bg-superficie" />
      <div className="h-24 rounded-bloco bg-superficie" />
    </div>
  );
}

/** Estado vazio: convite para agir, nunca um pedido de desculpas. */
export function Vazio({ titulo, texto, acao }: { titulo: string; texto: string; acao?: ReactNode }) {
  return (
    <section className="flex flex-col items-start gap-3 rounded-bloco border border-borda bg-superficie p-6 sm:p-8">
      <h2 className="text-2xl font-bold">{titulo}</h2>
      <p className="max-w-prose text-texto-suave">{texto}</p>
      {acao && <div className="mt-2">{acao}</div>}
    </section>
  );
}
