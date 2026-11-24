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

export const IconePergunta = (p: P) => (
  <Icone {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.2" />
    <path d="M12 17h.01" />
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
