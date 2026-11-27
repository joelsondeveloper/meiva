"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconeAlerta, IconeEnviar, IconeMicrofone, IconeParar } from "@/components/icones";
import {
  AVISO_A_PARTIR_DE,
  ERRO_CURTO,
  ERRO_INTERROMPIDA,
  ERRO_SEM_SUPORTE,
  LIMITE_SEGUNDOS,
  MINIMO_MS,
  escolherTipoGravacao,
  formatarTempo,
  mensagemErroMicrofone,
} from "@/lib/chat/audio";
import { textoDoErro, transcreverAudio } from "@/lib/chat/api";

export type FaseGravacao = "parado" | "pedindo" | "gravando" | "transcrevendo";

type Opcoes = {
  /** Texto transcrito (já limpo e não vazio). */
  onTexto: (texto: string) => void;
};

/**
 * Grava com o MediaRecorder: um toque começa, outro termina; para sozinho em
 * 60 s. O áudio só existe na memória até a resposta da transcrição.
 */
export function useGravador({ onTexto }: Opcoes) {
  const [fase, setFase] = useState<FaseGravacao>("parado");
  const [segundos, setSegundos] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  const gravador = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const relogio = useRef<ReturnType<typeof setInterval> | null>(null);
  const inicio = useRef(0);
  /** true quando a gravação deve ser jogada fora (saiu da tela). */
  const descartar = useRef(false);
  const pedido = useRef<AbortController | null>(null);
  const onTextoRef = useRef(onTexto);
  useEffect(() => {
    onTextoRef.current = onTexto;
  }, [onTexto]);

  const soltarMicrofone = useCallback(() => {
    if (relogio.current) clearInterval(relogio.current);
    relogio.current = null;
    // Desliga o microfone de verdade (some o aviso de "microfone em uso" do sistema).
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);

  const parar = useCallback(() => {
    const g = gravador.current;
    if (g && g.state !== "inactive") g.stop();
  }, []);

  async function enviar(audio: Blob) {
    setFase("transcrevendo");
    const controle = new AbortController();
    pedido.current = controle;
    try {
      const { texto } = await transcreverAudio(audio, controle.signal);
      if (!controle.signal.aborted) onTextoRef.current(texto);
    } catch (e) {
      if (!controle.signal.aborted) setErro(textoDoErro(e));
    } finally {
      if (!controle.signal.aborted) setFase("parado");
      pedido.current = null;
    }
  }

  async function iniciar() {
    setErro(null);
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setErro(ERRO_SEM_SUPORTE);
      return;
    }

    setFase("pedindo");
    let microfone: MediaStream;
    try {
      microfone = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (e) {
      setErro(mensagemErroMicrofone(e));
      setFase("parado");
      return;
    }

    let g: MediaRecorder;
    try {
      const tipo = escolherTipoGravacao((t) => MediaRecorder.isTypeSupported(t));
      g = new MediaRecorder(microfone, tipo ? { mimeType: tipo } : undefined);
    } catch (e) {
      microfone.getTracks().forEach((t) => t.stop());
      setErro(mensagemErroMicrofone(e));
      setFase("parado");
      return;
    }

    stream.current = microfone;
    gravador.current = g;
    descartar.current = false;
    const pedacos: Blob[] = [];
    let interrompida = false;

    g.ondataavailable = (ev) => {
      if (ev.data.size > 0) pedacos.push(ev.data);
    };
    g.onerror = () => {
      interrompida = true;
      if (g.state !== "inactive") g.stop();
    };
    g.onstop = () => {
      const duracao = performance.now() - inicio.current;
      soltarMicrofone();
      gravador.current = null;
      if (descartar.current) return;
      if (interrompida) {
        setErro(ERRO_INTERROMPIDA);
        setFase("parado");
        return;
      }
      if (duracao < MINIMO_MS || pedacos.length === 0) {
        setErro(ERRO_CURTO);
        setFase("parado");
        return;
      }
      // O tipo do gravador (o iOS diz "audio/mp4") é o que o servidor usa para saber o formato.
      void enviar(new Blob(pedacos, { type: g.mimeType || pedacos[0].type }));
    };

    // Pedaços de 1 s: se algo travar no fim, o que já foi gravado não se perde.
    g.start(1000);
    inicio.current = performance.now();
    setSegundos(0);
    setFase("gravando");
    relogio.current = setInterval(() => {
      const s = (performance.now() - inicio.current) / 1000;
      setSegundos(Math.floor(s));
      if (s >= LIMITE_SEGUNDOS) parar();
    }, 250);
  }

  function alternar() {
    if (fase === "parado") void iniciar();
    else if (fase === "gravando") parar();
  }

  // Saiu da tela: para tudo, sem transcrever.
  useEffect(
    () => () => {
      descartar.current = true;
      pedido.current?.abort();
      const g = gravador.current;
      if (g && g.state !== "inactive") g.stop();
      soltarMicrofone();
    },
    [soltarMicrofone],
  );

  return { fase, segundos, erro, limparErro: () => setErro(null), alternar };
}

/** O que o botão redondo ao lado do campo faz agora. */
export type AcaoDoBotao = "gravar" | "enviar" | "parar";

/** Vazio: microfone. Com texto: Enviar. Gravando: Parar. */
export function acaoDoBotao(fase: FaseGravacao, texto: string): AcaoDoBotao {
  if (fase === "gravando") return "parar";
  return texto.trim() ? "enviar" : "gravar";
}

const ROTULO: Record<AcaoDoBotao, string> = {
  gravar: "Gravar áudio",
  enviar: "Enviar mensagem",
  parar: "Parar gravação",
};

/**
 * O único botão ao lado do campo (48px, redondo). Fica sempre no mesmo lugar:
 * o segundo toque (parar, enviar) cai no mesmo ponto do primeiro.
 * - gravar: contorno petróleo (o campo vazio já convida a falar);
 * - enviar: âmbar cheio (o botão principal da tela);
 * - parar: petróleo cheio, quadrado + "Parar" escrito.
 * Nunca fica "apagado": enquanto espera (permissão, transcrição, resposta)
 * avisa com aria-busy e o cursor de espera, sem mudar de cor.
 */
export function BotaoDoCampo({
  acao,
  ocupado,
  onGravarOuParar,
}: {
  acao: AcaoDoBotao;
  ocupado: boolean;
  onGravarOuParar: () => void;
}) {
  const rotulo = ROTULO[acao];
  return (
    <button
      type={acao === "enviar" ? "submit" : "button"}
      onClick={(e) => {
        if (ocupado) {
          e.preventDefault();
          return;
        }
        if (acao !== "enviar") onGravarOuParar();
      }}
      aria-label={rotulo}
      aria-busy={ocupado || undefined}
      title={rotulo}
      data-acao={acao}
      className="flex h-12 min-w-12 shrink-0 items-center justify-center gap-2 rounded-full border-2 transition-[background-color,border-color,color,scale] duration-150 ease-out active:scale-[0.95] aria-busy:cursor-wait data-[acao=enviar]:border-acento data-[acao=enviar]:bg-acento data-[acao=enviar]:text-sobre-acento data-[acao=enviar]:hover:border-acento-forte data-[acao=enviar]:hover:bg-acento-forte data-[acao=gravar]:border-primaria data-[acao=gravar]:bg-superficie data-[acao=gravar]:text-primaria data-[acao=gravar]:hover:bg-primaria-suave data-[acao=parar]:border-primaria data-[acao=parar]:bg-primaria data-[acao=parar]:min-[360px]:px-4 data-[acao=parar]:font-bold data-[acao=parar]:text-sobre-primaria data-[acao=parar]:hover:bg-primaria-forte"
    >
      {/* key: troca o ícone com um fade curto (só fade com reduced-motion). */}
      <span key={acao} className="flex animate-trocar-icone items-center gap-2">
        {acao === "parar" ? (
          <>
            <IconeParar className="size-5" />
            <span aria-hidden="true" className="max-[359px]:hidden">Parar</span>
          </>
        ) : acao === "enviar" ? (
          <IconeEnviar className="size-5 -translate-x-px translate-y-px" />
        ) : (
          <IconeMicrofone className="size-6" />
        )}
      </span>
    </button>
  );
}

/**
 * O que aparece DENTRO do campo no lugar do texto enquanto grava ou
 * transcreve: "Gravando… 0:12" (ponto + texto, nunca só cor) e, nos últimos
 * 10 s, "Termina sozinho em X s". Retorna null quando o campo mostra o texto.
 */
export function StatusNoCampo({ fase, segundos }: { fase: FaseGravacao; segundos: number }) {
  if (fase === "gravando") {
    const faltam = Math.max(0, LIMITE_SEGUNDOS - segundos);
    return (
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3">
        <p role="status" className="flex items-center gap-2 font-bold">
          <span aria-hidden="true" className="size-3 shrink-0 self-center rounded-full bg-erro motion-safe:animate-pulsar" />
          Gravando…
          {/* O tempo não é anunciado a cada segundo: só o "Gravando…". */}
          <span aria-hidden="true" className="valor">{formatarTempo(segundos)}</span>
        </p>
        {segundos >= AVISO_A_PARTIR_DE && (
          <p role="status" className="text-texto-suave">
            Termina sozinho em <span className="valor">{faltam}</span> s
          </p>
        )}
      </div>
    );
  }
  if (fase === "transcrevendo") {
    return (
      <p role="status" className="flex items-center gap-3 text-texto-suave">
        <span className="flex gap-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-primaria motion-safe:animate-pulse" />
          <span className="size-2 rounded-full bg-primaria motion-safe:animate-pulse [animation-delay:200ms]" />
          <span className="size-2 rounded-full bg-primaria motion-safe:animate-pulse [animation-delay:400ms]" />
        </span>
        Escrevendo o que você falou…
      </p>
    );
  }
  return null;
}

/** Linha logo acima do campo: o pedido de permissão ou o erro com o que fazer. */
export function AvisoAcimaDoCampo({ fase, erro }: { fase: FaseGravacao; erro: string | null }) {
  if (fase === "pedindo") {
    return (
      <p role="status" className="mb-2 text-texto-suave animate-entrar">
        Se o celular perguntar, toque em Permitir para usar o microfone.
      </p>
    );
  }
  if (erro && fase === "parado") {
    return (
      <p role="alert" className="mb-2 flex items-start gap-2 break-words text-erro animate-entrar">
        <IconeAlerta className="mt-0.5 size-5" />
        <span className="min-w-0">{erro}</span>
      </p>
    );
  }
  return null;
}
