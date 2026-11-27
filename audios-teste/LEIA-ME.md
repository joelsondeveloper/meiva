# Áudios de teste da transcrição

Esta pasta guarda gravações para comparar os modelos de transcrição
(`npm run comparar-audio`). **Os áudios nunca vão para o git** (voz é dado
pessoal; veja `.gitignore`): só este arquivo é versionado.

## Como gravar

- Use o gravador do celular (Gravador de voz, Notas de voz do iPhone, WhatsApp
  exportado etc.). Qualquer formato serve: m4a, mp3, ogg, opus, webm, wav.
- O nome do arquivo começa com o **número da frase**: `01.m4a`, `02.m4a`...
  Mais de uma versão da mesma frase: `01-a.m4a`, `01-b.m4a`.
- Fale do jeito natural, como falaria no balcão. Vale variar: rápido, devagar,
  com barulho de fundo, outra pessoa falando (ex.: alguém mais velho).
- Bônus útil: um áudio de ~3 s só de barulho/silêncio com nome `99.m4a`
  (testa se o modelo "inventa" texto). Frase 99 não existe, então o script só
  mostra o que veio.

## Frases

| Nº | Fale                                                                                 |
|----|--------------------------------------------------------------------------------------|
| 01 | vendi cinquenta de pudim no pix                                                      |
| 02 | vendi três blusas a cinquenta conto no dinheiro                                      |
| 03 | recebi vinte pila do João                                                            |
| 04 | a dona Maria levou dois bolos fiado, quarenta reais                                  |
| 05 | paguei mil e duzentos de aluguel                                                     |
| 06 | comprei farinha, oitenta e cinco e noventa                                           |
| 07 | o Zé pagou o fiado de trinta e cinco                                                 |
| 08 | gastei cento e cinquenta de gasolina no cartão                                       |
| 09 | vendi um bolo de pote por doze e cinquenta no pix                                    |
| 10 | quanto eu vendi hoje?                                                                |
| 11 | apaga o último                                                                       |
| 12 | vendi dois mil e quinhentos de salgado pra festa, metade no pix e metade no dinheiro |

## Rodar

```
npm run comparar-audio
```

Precisa de `ffmpeg`/`ffprobe` no PATH (o script converte cada áudio para
webm/opus, como grava o Chrome Android, e mp4/aac, como grava o iOS Safari).
