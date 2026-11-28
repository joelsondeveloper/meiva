import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Lexend } from "next/font/google";
import { Navegacao } from "@/components/navegacao/navegacao";
import "./globals.css";

/**
 * Atkinson Hyperlegible Next: desenhada pelo Braille Institute para quem
 * enxerga pouco (letras bem distintas: I/l/1, O/0). Uma família só no app.
 */
const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

/**
 * Lexend só nos valores em reais (--fonte-valor, classe `valor`): o zero sem
 * corte da Lexend é mais familiar que o zero cortado da Atkinson (escolha do
 * dono do produto, para testar com pessoas reais). O resto do texto continua
 * na Atkinson.
 */
const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const TITULO = "MEIva: o caixa do seu negócio numa conversa";
const DESCRICAO_CURTA = "Anote vendas, gastos e fiado escrevendo do seu jeito. A MEIva organiza o caixa do seu MEI.";

/**
 * Endereço completo do site, exigido pelas tags de compartilhamento (og:image
 * precisa de URL absoluta). Na Vercel vem das variáveis de sistema (domínio de
 * produção, ou o da prévia); no computador, localhost.
 */
const URL_DO_SITE = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

/** Imagem de compartilhamento (public/og-image.png), liberada sem senha no proxy. */
const IMAGEM_COMPARTILHAMENTO = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "MEIva: o caixa do seu negócio numa conversa.",
};

export const metadata: Metadata = {
  metadataBase: new URL(URL_DO_SITE),
  title: {
    default: TITULO,
    template: "%s · MEIva",
  },
  description:
    "Anote vendas, gastos e fiado escrevendo do seu jeito, como numa conversa. A MEIva organiza o caixa do seu MEI.",
  applicationName: "MEIva",
  // Nome embaixo do ícone quando a pessoa adiciona o app à tela inicial do iPhone.
  appleWebApp: { title: "MEIva" },
  openGraph: {
    title: TITULO,
    description: DESCRICAO_CURTA,
    siteName: "MEIva",
    locale: "pt_BR",
    type: "website",
    images: [IMAGEM_COMPARTILHAMENTO],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRICAO_CURTA,
    images: [IMAGEM_COMPARTILHAMENTO],
  },
  formatDetection: { telephone: false },
};

/**
 * Cor da barra do navegador no celular, igual à superfície do app (--cor-superficie).
 * Meta tag não lê CSS, então o valor é repetido aqui; tests/tema.test.ts avisa
 * se divergir de globals.css.
 */
const COR_BARRA = {
  claro: "#fdfdfb",
  escuro: "#1b2422",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Sem maximumScale/userScalable: quem enxerga menos precisa poder dar zoom.
  // "cover" + env(safe-area-inset-*) no CSS: respeita o notch e a barra de gestos.
  viewportFit: "cover",
  // No Android, o teclado encolhe o layout (e o 100dvh), e o campo fica visível.
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: COR_BARRA.claro },
    { media: "(prefers-color-scheme: dark)", color: COR_BARRA.escuro },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${atkinson.variable} ${lexend.variable} h-full antialiased`}>
      <body className="min-h-full bg-fundo text-texto">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-superficie focus:px-4 focus:py-3"
        >
          Pular para o conteúdo
        </a>
        <div className="lg:flex">
          <Navegacao />
          <div id="conteudo" className="min-w-0 flex-1">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
