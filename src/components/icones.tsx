import type { ReactNode, SVGProps } from "react";

/**
 * Ícones em SVG inline. Herdam a cor do texto (currentColor), então seguem os
 * design tokens. São decorativos (aria-hidden): o significado sempre está
 * também em texto ao lado.
 */
function Icone({ children, className = "size-6", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
      {...props}
    >
      {children as ReactNode}
    </svg>
  );
}

type P = { className?: string };

/** Dinheiro entrando: seta para baixo e para a esquerda. */
export const IconeEntrada = (p: P) => (
  <Icone {...p}>
    <path d="M17 7 7 17" />
    <path d="M17 17H7V7" />
  </Icone>
);

/** Dinheiro saindo: seta para cima e para a direita. */
export const IconeSaida = (p: P) => (
  <Icone {...p}>
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </Icone>
);

/** Fiado / a receber: relógio. */
export const IconeFiado = (p: P) => (
  <Icone {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icone>
);

/** Caixa inicial (aporte do dono): cofre com um "+". */
export const IconeAporte = (p: P) => (
  <Icone {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M12 10.5v6" />
    <path d="M9 13.5h6" />
  </Icone>
);

/** Retirada pessoal: pessoa com uma seta saindo. */
export const IconeRetirada = (p: P) => (
  <Icone {...p}>
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <path d="M17 11h5" />
    <path d="m20 8 3 3-3 3" />
  </Icone>
);

/** Aba Conversa: balão de fala. */
export const IconeConversa = (p: P) => (
  <Icone {...p}>
    <path d="M21 12a8 8 0 0 1-11.8 7L4 20.5l1.5-4.6A8 8 0 1 1 21 12z" />
  </Icone>
);

/** Aba Resumo: colunas de um gráfico simples. */
export const IconeResumo = (p: P) => (
  <Icone {...p}>
    <path d="M4 20h16" />
    <path d="M7 16v-5" />
    <path d="M12 16V6" />
    <path d="M17 16v-8" />
  </Icone>
);

/** Aba Fiados: duas pessoas. */
export const IconeFiados = (p: P) => (
  <Icone {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20v-1a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5v1" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
    <path d="M18.5 14a5 5 0 0 1 3 4.6V20" />
  </Icone>
);

export const IconeVoltar = (p: P) => (
  <Icone {...p}>
    <path d="m15 18-6-6 6-6" />
  </Icone>
);

export const IconeAvancar = (p: P) => (
  <Icone {...p}>
    <path d="m9 18 6-6-6-6" />
  </Icone>
);

export const IconeSaldo = (p: P) => (
  <Icone {...p}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18" />
    <path d="M16 14.5h2" />
  </Icone>
);

export const IconeDesfazer = (p: P) => (
  <Icone {...p}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </Icone>
);

/** Começar outra conversa: balão com "+". */
export const IconeNovaConversa = (p: P) => (
  <Icone {...p}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
  </Icone>
);

export const IconeEnviar = (p: P) => (
  <Icone {...p}>
    <path d="m22 2-11 11" />
    <path d="M22 2 15 22l-4-9-9-4 20-7z" />
  </Icone>
);

export const IconeCerto = (p: P) => (
  <Icone {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 3 3 5-6" />
  </Icone>
);

export const IconeAlerta = (p: P) => (
  <Icone {...p}>
    <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Icone>
);

export const IconeSeta = (p: P) => (
  <Icone {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icone>
);

/** Gravar áudio. */
export const IconeMicrofone = (p: P) => (
  <Icone {...p}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
    <path d="M12 18v4" />
  </Icone>
);

/** Parar a gravação: quadrado cheio, o símbolo de "parar" de qualquer gravador. */
export const IconeParar = (p: P) => (
  <Icone {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
  </Icone>
);
