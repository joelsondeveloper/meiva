"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconeConversa, IconeFiados, IconeResumo } from "@/components/icones";
import { Marca } from "@/components/marca";

/** As três páginas, na mesma ordem e com os mesmos nomes no celular e no computador. */
const PAGINAS = [
  { href: "/", rotulo: "Conversa", Icone: IconeConversa },
  { href: "/resumo", rotulo: "Resumo", Icone: IconeResumo },
  { href: "/fiados", rotulo: "Fiados", Icone: IconeFiados },
] as const;

const ativa = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

/**
 * Celular: barra de abas fixa embaixo (ícone + rótulo sempre visíveis).
 * Computador (≥ 1024px): barra lateral com a marca no topo.
 * A aba atual muda de cor E de forma (pílula preenchida, texto em negrito)
 * e é anunciada com aria-current.
 */
export function Navegacao() {
  const pathname = usePathname();

  return (
    <>
      <nav
        aria-label="Páginas"
        className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-8 border-r border-borda bg-superficie px-4 py-6 lg:flex"
      >
        <Link href="/" className="flex min-h-12 items-center rounded-lg px-3">
          <Marca className="text-3xl" />
          <span className="sr-only">: início</span>
        </Link>
        <ul className="flex flex-col gap-2">
          {PAGINAS.map(({ href, rotulo, Icone }) => {
            const atual = ativa(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={atual ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-controle px-4 text-lg transition-colors duration-150 ${
                    atual
                      ? "bg-primaria-suave font-bold text-primaria"
                      : "text-texto-suave hover:bg-fundo hover:text-texto"
                  }`}
                >
                  <Icone />
                  {rotulo}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav
        aria-label="Páginas"
        data-abas
        className="fixed inset-x-0 bottom-0 z-20 border-t border-borda bg-superficie pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="mx-auto grid h-18 max-w-md grid-cols-3 px-2">
          {PAGINAS.map(({ href, rotulo, Icone }) => {
            const atual = ativa(pathname, href);
            return (
              <li key={href} className="flex">
                <Link
                  href={href}
                  aria-current={atual ? "page" : undefined}
                  className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 text-base transition-[color,scale] duration-150 active:scale-[0.97] before:absolute before:inset-x-5 before:top-0 before:h-[3px] before:rounded-b-full before:bg-primaria before:transition-transform before:duration-200 before:ease-[var(--ease-saida)] ${
                    atual ? "font-bold text-primaria before:scale-x-100" : "text-texto-suave before:scale-x-0"
                  }`}
                >
                  <Icone className="size-6" />
                  {rotulo}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
