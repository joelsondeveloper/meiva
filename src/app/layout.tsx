import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MEIva: o caixa da sua loja numa conversa",
    template: "%s · MEIva",
  },
  description:
    "Anote vendas, gastos e fiado escrevendo do seu jeito, como no WhatsApp. A MEIva organiza o caixa do dia do seu MEI.",
  applicationName: "MEIva",
  formatDetection: { telephone: false },
};

/**
 * Cor da barra do navegador no celular, igual ao topo do app (--cor-superficie).
 * Meta tag não lê CSS, então o valor é repetido aqui; tests/tema.test.ts avisa
 * se divergir de globals.css.
 */
const COR_BARRA = {
  claro: "#ffffff",
  escuro: "#18181b",
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
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-fundo text-texto">{children}</body>
    </html>
  );
}
