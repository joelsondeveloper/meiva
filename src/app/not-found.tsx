import type { Metadata } from "next";
import { BotaoPrincipal, Pagina } from "@/components/pagina";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <Pagina titulo="Página não encontrada" descricao="O endereço pode estar errado ou a página não existe mais.">
      <BotaoPrincipal href="/">Ir para a Conversa</BotaoPrincipal>
    </Pagina>
  );
}
