import type { MetadataRoute } from "next";

/**
 * Manifesto do app (/manifest.webmanifest): permite "Adicionar à tela inicial"
 * e abre a MEIva sem a barra do navegador.
 *
 * O manifesto não lê CSS, então as duas cores repetem tokens de globals.css:
 * theme_color = --cor-superficie (igual ao theme-color do layout) e
 * background_color = --cor-fundo (fundo da tela de abertura). tests/tema.test.ts
 * avisa se divergirem.
 *
 * Os ícones ficam em public/ e o proxy os libera sem senha (src/proxy.ts),
 * porque o navegador busca o manifesto e os ícones sem credenciais.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MEIva",
    short_name: "MEIva",
    description: "O caixa do seu negócio numa conversa.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    theme_color: "#fdfdfb",
    background_color: "#f2f4f2",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
