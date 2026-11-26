import { categoriaDo } from "@/lib/chat/categoria";
import type { Mensagem } from "@/lib/chat/conversa";
import { calcularSaldo } from "@/lib/lancamentos/saldo";
import type { LancamentoSalvo } from "@/lib/lancamentos/tipos";
import { IconeAlerta, IconeDesfazer } from "@/components/icones";
import { LinhaLancamento } from "@/components/lancamento/linha";
import { Valor } from "@/components/valor";

/** O texto da MEIva não fica em bolha: só a pessoa tem bolha (não é um mensageiro). */
const TEXTO_MEIVA = "mr-auto w-full max-w-[36rem]";

type Props = {
  mensagem: Mensagem;
  /** Id do lançamento cujo "Desfazer" está em andamento (bloqueia os outros botões). */
  desfazendo?: string | null;
  onDesfazer?: (mensagemId: string, lancamento: LancamentoSalvo) => void;
  /** Saldo de hoje, mostrado só no comprovante mais recente ("Caixa de hoje agora"). */
  caixaAgora?: number | null;
};

const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

function horaDe(lancamentos: LancamentoSalvo[]): string | null {
  const criado = lancamentos[0]?.created_at;
  if (!criado) return null;
  const data = new Date(criado);
  return Number.isNaN(data.getTime()) ? null : hora.format(data);
}

export function BolhaMensagem({ mensagem, desfazendo = null, onDesfazer, caixaAgora = null }: Props) {
  if (mensagem.autor === "usuario") {
    return (
      <div className="ml-auto max-w-[85%] rounded-apoio rounded-br-md bg-primaria px-5 py-3 text-sobre-primaria sm:max-w-[28rem]">
        <span className="sr-only">Você: </span>
        <p className="break-words whitespace-pre-wrap">{mensagem.texto}</p>
      </div>
    );
  }

  if (mensagem.tipo === "resposta") {
    return (
      <div className={`${TEXTO_MEIVA} flex flex-col gap-3`}>
        <p className="break-words whitespace-pre-wrap">
          <span className="sr-only">MEIva: </span>
          {mensagem.texto}
        </p>
        {mensagem.lancamentos.length > 0 && (
          <Comprovante
            mensagemId={mensagem.id}
            lancamentos={mensagem.lancamentos}
            desfeitos={mensagem.desfeitos}
            desfazendo={desfazendo}
            onDesfazer={onDesfazer}
            caixaAgora={caixaAgora}
          />
        )}
      </div>
    );
  }

  if (mensagem.tipo === "desfeito") {
    // A linha do comprovante já mostra "Desfeito" riscado; aqui só o leitor de tela ouve o aviso.
    return (
      <p className="sr-only">
        MEIva: {mensagem.texto}
      </p>
    );
  }

  return (
    <div className={`${TEXTO_MEIVA} rounded-apoio border border-erro bg-erro-suave px-5 py-4`}>
      <p className="flex items-start gap-2">
        <span className="text-erro">
          <IconeAlerta />
        </span>
        <span>
          <span className="sr-only">Erro: </span>
          {mensagem.texto}
        </span>
      </p>
    </div>
  );
}

/**
 * Comprovante: o que foi anotado nesta resposta, a hora, e quanto o caixa
 * mudou. É o momento de confiança: a pessoa vê o que entrou na conta e o efeito
 * no dinheiro, sem sair da conversa. Cada linha tem o seu Desfazer.
 */
function Comprovante({
  mensagemId,
  lancamentos,
  desfeitos,
  desfazendo,
  onDesfazer,
  caixaAgora,
}: {
  mensagemId: string;
  lancamentos: LancamentoSalvo[];
  desfeitos: string[];
  desfazendo: string | null;
  onDesfazer?: (mensagemId: string, lancamento: LancamentoSalvo) => void;
  caixaAgora: number | null;
}) {
  const validos = lancamentos.filter((l) => !desfeitos.includes(l.id));
  const mudanca = calcularSaldo(validos).saldo;
  const quando = horaDe(lancamentos);
  const quantos = lancamentos.length === 1 ? "1 anotação" : `${lancamentos.length} anotações`;

  return (
    <section
      aria-label={`Comprovante: ${quantos}`}
      className="overflow-hidden rounded-apoio border border-borda bg-superficie"
    >
      <p className="flex justify-between gap-3 bg-primaria-suave px-4 py-2 text-texto-suave">
        <span>{quando ? `Anotado às ${quando}` : "Anotado"}</span>
        <span>{quantos}</span>
      </p>
      <ul className="divide-y divide-borda px-4">
        {lancamentos.map((l) => {
          const desfeito = desfeitos.includes(l.id);
          return (
            <li key={l.id} className="motion-safe:animate-entrar">
              <LinhaLancamento
                lancamento={l}
                riscado={desfeito}
                acao={
                  !desfeito &&
                  onDesfazer && (
                    <button
                      type="button"
                      onClick={() => onDesfazer(mensagemId, l)}
                      disabled={desfazendo !== null}
                      aria-label={`Desfazer: ${l.descricao}`}
                      className="-mr-2 -mb-2 flex min-h-12 items-center gap-1 rounded-controle px-2 text-texto-suave underline-offset-4 transition-colors duration-150 hover:text-texto hover:underline disabled:cursor-wait"
                    >
                      <IconeDesfazer className="size-5" />
                      {desfazendo === l.id ? "Desfazendo…" : "Desfazer"}
                    </button>
                  )
                }
              />
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col gap-1 border-t border-dashed border-borda-forte px-4 py-3">
        <p className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="text-texto-suave">Mudou no caixa</span>
          {mudanca === 0 ? (
            <span className="font-bold">Nada</span>
          ) : (
            <Valor
              centavos={Math.abs(mudanca)}
              sinal={mudanca > 0 ? "+" : "−"}
              className={`font-bold ${mudanca > 0 ? "text-entrada" : "text-saida"}`}
            />
          )}
        </p>
        {validos.some((l) => categoriaDo(l) === "fiado") && (
          <p className="text-texto-suave">Fiado só entra no caixa quando a pessoa pagar.</p>
        )}
        {caixaAgora !== null && (
          <p className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="font-bold">Caixa de hoje agora</span>
            <Valor centavos={caixaAgora} className={`text-xl font-bold ${caixaAgora < 0 ? "text-saida" : ""}`} />
          </p>
        )}
      </div>
    </section>
  );
}

/** Enquanto a resposta não chega. */
export function BolhaAnotando() {
  return (
    <div className={TEXTO_MEIVA} role="status">
      <p className="flex items-center gap-3 text-texto-suave">
        <span className="flex gap-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-primaria motion-safe:animate-pulse" />
          <span className="size-2 rounded-full bg-primaria motion-safe:animate-pulse [animation-delay:200ms]" />
          <span className="size-2 rounded-full bg-primaria motion-safe:animate-pulse [animation-delay:400ms]" />
        </span>
        Anotando…
      </p>
    </div>
  );
}
