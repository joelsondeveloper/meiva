import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "MEIva: o caixa da sua loja numa conversa",
    template: "%s · MEIva",
  },
  description:
    "Anote vendas, gastos e fiado escrevendo do seu jeito, como no WhatsApp. A MEIva organiza o caixa do seu MEI.",
  applicationName: "MEIva",
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
    <html lang="pt-BR" className={`${atkinson.variable} h-full antialiased`}>
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
