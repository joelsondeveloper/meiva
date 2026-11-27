"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconeAlerta, IconeMicrofone, IconeParar } from "@/components/icones";
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

/** Botão ao lado do campo. Mesmo lugar e tamanho nos dois estados: o segundo toque cai no mesmo ponto. */
export function BotaoMicrofone({ fase, onClick }: { fase: FaseGravacao; onClick: () => void }) {
  const gravando = fase === "gravando";
  const ocupado = fase === "pedindo" || fase === "transcrevendo";
  const rotulo = gravando ? "Parar gravação" : "Gravar áudio";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={ocupado}
      aria-label={rotulo}
      title={rotulo}
      data-gravando={gravando || undefined}
      className="flex min-h-14 min-w-14 items-center justify-center rounded-controle border-2 border-primaria text-primaria transition-[background-color,color,scale] duration-150 ease-out hover:bg-primaria-suave active:scale-[0.97] disabled:cursor-wait disabled:opacity-60 data-gravando:bg-primaria data-gravando:text-sobre-primaria data-gravando:hover:bg-primaria-forte"
    >
      {/* key: troca o ícone com um fade curto, em vez de pular. */}
      <span key={gravando ? "parar" : "mic"} className="animate-trocar-icone">
        {gravando ? <IconeParar className="size-6" /> : <IconeMicrofone className="size-6" />}
      </span>
    </button>
  );
}

/**
 * Linha de estado acima do campo: "Gravando 0:07" (texto + ponto, nunca só
 * cor), "Escrevendo o que você falou…" ou o erro com o que fazer.
 */
export function EstadoGravacao({ fase, segundos, erro }: { fase: FaseGravacao; segundos: number; erro: string | null }) {
  if (fase === "gravando") {
    const faltam = LIMITE_SEGUNDOS - segundos;
    return (
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 animate-entrar">
        <p role="status" className="flex items-center gap-2 text-lg font-bold">
          <span aria-hidden="true" className="size-3 shrink-0 self-center rounded-full bg-erro motion-safe:animate-pulsar" />
          Gravando
          {/* O tempo não é anunciado a cada segundo: só o "Gravando". */}
          <span aria-hidden="true" className="tabular-nums">{formatarTempo(segundos)}</span>
        </p>
        <p className="text-texto-suave">
          {segundos >= AVISO_A_PARTIR_DE
            ? `Termina sozinho em ${faltam} s.`
            : "Fale e toque no quadrado para terminar."}
        </p>
      </div>
    );
  }
  if (fase === "pedindo") {
    return (
      <p role="status" className="mb-2 text-texto-suave animate-entrar">
        Se o celular perguntar, toque em Permitir para usar o microfone.
      </p>
    );
  }
  if (fase === "transcrevendo") {
    return (
      <p role="status" className="mb-2 flex items-center gap-3 text-texto-suave animate-entrar">
        <span className="flex gap-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-primaria motion-safe:animate-pulse" />
          <span className="size-2 rounded-full bg-primaria motion-safe:animate-pulse [animation-delay:200ms]" />
          <span className="size-2 rounded-full bg-primaria motion-safe:animate-pulse [animation-delay:400ms]" />
        </span>
        Escrevendo o que você falou…
      </p>
    );
  }
  if (erro) {
    return (
      <p role="alert" className="mb-2 flex items-start gap-2 text-erro animate-entrar">
        <IconeAlerta className="mt-0.5 size-5" />
        {erro}
      </p>
    );
  }
  return null;
}
