import { Fragment } from "react";

/** Números dentro de uma frase: "50", "12,50", "1.200", "0:12". */
const NUMERO = /(\d+(?:[.,:]\d+)*)/;

/**
 * Texto corrido em que os números ("50 reais", "30 de luz") usam a mesma
 * fonte dos valores em reais (--fonte-valor, a Lexend, sem o zero cortado).
 * O resto da frase continua na fonte do texto.
 */
export function TextoComNumeros({ children }: { children: string }) {
  const partes = children.split(NUMERO);
  return (
    <>
      {partes.map((parte, i) =>
        i % 2 === 1 ? (
          <span key={i} className="numero">
            {parte}
          </span>
        ) : (
          <Fragment key={i}>{parte}</Fragment>
        ),
      )}
    </>
  );
}
