/**
 * Logo da MEIva: "MEI" negrito + "va" normal, com o I desenhado como cursor de
 * texto (serifas retas e curtas) em âmbar. As letras são curvas, não texto:
 * gerado de docs/marca/final/svg/logo/meiva-logo-claro.svg (regras em docs/marca/guia.md).
 *
 * Cores pelos tokens: --cor-marca nas letras e --cor-marca-cursor no I
 * (âmbar-tinta no claro, âmbar no escuro). A altura vem da className
 * (é a altura das maiúsculas); nunca abaixo de 18px.
 */
export function Marca({ className = "h-5" }: { className?: string }) {
  return (
    <svg viewBox="88 -700 2970.1 710" role="img" aria-label="MEIva" className={`w-auto shrink-0 ${className}`}>
      <path className="fill-marca" d="M88 0L88 -700L290.5 -700L439 -442.8L587.5 -700L790 -700L790 0L625 0L625 -435L472 -170L406 -170L253 -435L253 0ZM955.67 0V-700H1443.75V-555.23H1120.51V-144.77H1454.08V0ZM1035.67 -286.9V-425.35H1399.08V-286.9ZM2174.08 0 1952.08 -525H2063.08L2223.08 -132L2204.08 -123L2375.08 -525H2481.08L2248.08 0ZM2771.08 10Q2706.08 10 2652.58 -26Q2599.08 -62 2567.08 -124Q2535.08 -186 2535.08 -264Q2535.08 -343 2567.58 -404.5Q2600.08 -466 2655.58 -501Q2711.08 -536 2780.08 -536Q2821.08 -536 2855.08 -524Q2889.08 -512 2914.58 -490.5Q2940.08 -469 2956.58 -441Q2973.08 -413 2977.08 -381L2954.08 -389V-525H3058.08V0H2954.08V-125L2978.08 -132Q2972.08 -105 2953.58 -79.5Q2935.08 -54 2906.58 -34Q2878.08 -14 2843.58 -2Q2809.08 10 2771.08 10ZM2798.08 -85Q2845.08 -85 2881.08 -108Q2917.08 -131 2937.58 -171.5Q2958.08 -212 2958.08 -264Q2958.08 -315 2937.58 -355Q2917.08 -395 2881.08 -418Q2845.08 -441 2798.08 -441Q2752.08 -441 2716.58 -418Q2681.08 -395 2660.58 -355Q2640.08 -315 2640.08 -264Q2640.08 -212 2660.58 -171.5Q2681.08 -131 2716.58 -108Q2752.08 -85 2798.08 -85Z" />
      <path className="fill-marca-cursor" d="M1582.1 -700L1882.1 -700L1882.1 -570L1822.1 -570L1822.1 -130L1882.1 -130L1882.1 0L1582.1 0L1582.1 -130L1642.1 -130L1642.1 -570L1582.1 -570Z" />
    </svg>
  );
}
