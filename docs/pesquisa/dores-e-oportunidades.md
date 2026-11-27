# Dores e oportunidades

Cada linha liga uma dor a uma evidência. Quando a dor é suposta e ainda não tem número, está marcada como **[hipótese]**. "O que a MEIva já faz" foi conferido no código da branch `main` em 27/11/2026 (`src/`). Fontes em [fontes.md](fontes.md).

Escala de impacto e esforço: **A** alto, **M** médio, **B** baixo. Esforço pensado para uma pessoa só, no código atual.

## Tabela

| # | Dor | Evidência | O que a MEIva já faz | O que falta | Impacto × esforço |
| --- | --- | --- | --- | --- | --- |
| 1 | Misturar o dinheiro pessoal e o do negócio | 61% dos pequenos negócios pagam despesa da empresa com a conta pessoal; 67% no Nordeste [F13, F14] | Entende "retirada pessoal" e "caixa inicial" como tipos próprios (`schema.ts`) | Não há exemplo de retirada na tela de boas-vindas; o Resumo não mostra quanto a pessoa tirou para si no período | **A × B** |
| 2 | Cobrar o fiado sem constrangimento | Os quatro apps de fiado olhados vendem cobrança pronta pelo WhatsApp, vários com link ou QR do Pix [F21, F22, F23, F24] | Aba Fiados com quanto falta por pessoa; "Registrar pagamento" abre a Conversa com a frase pronta | Botão que abre o WhatsApp com a mensagem pronta e editável (sem imitar o visual do WhatsApp) | **A × B** |
| 3 | Esquecer quando o fiado vence | Data combinada, "vence hoje" e "atrasados" aparecem em dois dos quatro apps de fiado olhados [F21, F24]; no Kyte, uma usuária reclamou de não conseguir registrar crediário parcelado [F16] | Pagamento parcial funciona (dado de exemplo "Marta pagou parte") | Campo de data combinada (pela conversa: "paga dia 10") e lista de atrasados | **A × M** |
| 4 | Não saber se está perto do teto do MEI | 33,4% dos MEIs não sabem o limite [F9]; teto é R$ 81 mil em 2026 e R$ 110 mil em 2027 [F1, F2] | Nada | "Este ano você vendeu R$ X de R$ 81 mil", com aviso perto dos 80%. **Antes:** confirmar com contador como contar fiado e retirada na receita bruta | **A × M** |
| 5 | Cumprir o Relatório Mensal de Receitas Brutas e a declaração de maio | Relatório mensal é obrigação legal [F8]; DASN-Simei vence em 31/05 [F7] | Os lançamentos já guardam data, valor e tipo | Gerar o relatório do mês para baixar ou imprimir | **A × M** |
| 6 | Conferir com o extrato do banco e da maquininha | O Sebrae diz que o Pix domina o recebimento, sem dar percentual [F13]. A conferência com o extrato é **[hipótese]** | Cada lançamento guarda a forma: Pix, dinheiro, cartão, fiado, outro (`schema.ts`) | Total por forma de pagamento no Resumo | **M × B** |
| 7 | Anotar com as mãos ocupadas | 80% dos usuários de WhatsApp mandam áudio [F12]; 83% dos internautas 60+ usam mensagens [F11] | Microfone grava até 1 minuto, mostra o texto para conferir e só envia quando a pessoa toca em Enviar | Exemplo de frase antes da primeira gravação; destacar o valor no texto para conferir; teste com sotaques locais | **A × B** |
| 8 | Erro de transcrição com sotaque, ruído e fala corrida | Whisper grande é o melhor nos testes em português, mas ainda erra mais com sotaque regional e ruído [F40]; modelos locais pequenos chegam a inventar texto [F41] | Usa `whisper-large-v3-turbo` por API e sempre pede revisão (`README.md`) | Medir com áudios reais do balcão (já há `audios-teste/`); mensagem clara quando o áudio sair ruim | **M × M** |
| 9 | Pouca familiaridade e público mais velho | 60+ usam menos internet (74,5%) [F10]; pessoas 65+ foram 43% mais lentas em sites (estudo de 2013) [F33]; menu suspenso e controle deslizante são difíceis no toque [F36] | Corpo 18px, alvo 48px, contraste 7:1, nunca só cor (`PRODUCT.md`); acima do mínimo de 24px da WCAG 2.2 [F30] e igual aos 48dp do Material [F38] | Revisar palavras técnicas e mensagens de erro [F32, F34]; testar com 2 pessoas de 60+ | **M × B** |
| 10 | Assinatura que muda ou bloqueia recurso | Kyte: cobrança depois do teste, preço mudado sem aviso, renovação não reconhecida [F16, F17]; Mobills: recurso que passou a exigir Premium [F25] | Ainda não há cobrança | Quando houver preço: dizer antes o que é grátis e nunca prender os dados já anotados atrás de pagamento | **M × B** (decisão de produto) |
| 11 | Ficar sem acesso ou sem ninguém para ajudar | Reclamações na InfinitePay de não conseguir entrar, troca de celular travando o acesso e falta de atendimento humano [F20], apesar da boa nota geral [F19]; no Kyte, suporte só por e-mail demorou [F16] | Senha única do app (`APP_PASSWORD`), sem conta por pessoa | Entrada sem senha para decorar (WCAG 2.2 pede autenticação acessível [F29, F30]) e um "Fale com uma pessoa" visível | **A × A** |
| 12 | Medo de apagar ou errar | Quita destaca uma lixeira que recupera o que foi apagado [F23]; idosos testam melhor quando se sentem seguros [F35] | Desfazer em cada linha; princípio "nada acontece sem a pessoa ver" | Ver o que foi desfeito e trazer de volta | **M × M** |
| 13 | Ficar sem internet no balcão | O Caderno do MEI anuncia funcionar sem internet e sem cadastro [F22]. A falta de sinal no balcão é **[hipótese]** | Precisa de internet (a IA roda no servidor) | Guardar a frase no aparelho e enviar quando voltar o sinal | **M × A** |
| 14 | Não saber o lucro | 36,7% dos MEIs pedem capacitação em controle financeiro [F9]. Que eles não saibam o lucro é **[hipótese]** | Resumo mostra "Sobrou" ou "Faltou" por período e lembra que fiado só conta quando pago | Validar se "Sobrou" é entendido como lucro; talvez mostrar o mês por padrão | **M × B** |
| 15 | Primeiro uso | Nas avaliações lidas não apareceu queixa específica de primeiro uso [F16]. **[hipótese]** | Conversa abre no campo com três frases de exemplo | Testar com o roteiro (tarefa 1) antes de mexer | **?** (falta dado) |

## Leitura rápida

- **Alto impacto e pouco esforço:** 1, 2, 7, 6, 9. Cabem num fim de semana.
- **Alto impacto e esforço médio:** 3, 4, 5. Precisam de mudança no banco ou de regra validada.
- **Alto impacto e muito esforço:** 11 (conta e login). É pré-requisito para ter usuários reais, então entra cedo mesmo sendo caro.
- **Precisam de dado antes:** 13, 14, 15.

## Diretrizes para público mais velho e voz

| Referência | O que pede | MEIva hoje | Ação |
| --- | --- | --- | --- |
| WCAG 2.2, 2.5.8 (AA) | Alvo de pelo menos 24×24 px ou espaço em volta; 2.5.5 (AAA) pede 44×44 px [F30, F31] | 48px em tudo, 56px no botão principal | Nada; já passa do AAA |
| WCAG 2.2, 2.5.7 (AA) | Toda ação de arrastar precisa de alternativa com um toque [F30] | Não há arrastar | Manter assim |
| WCAG 2.2, 2.4.11 (AA) | O foco não pode ficar escondido atrás de barra fixa [F30] | Barra de abas fixa embaixo no celular | Testar com teclado se o foco some atrás da barra |
| WCAG 2.2, autenticação acessível (AA) | Entrar sem ter que decorar ou digitar de novo senha difícil [F29, F30] | Senha única do app | Ver item 11 da tabela |
| Material 3 / Android | Alvo de 48×48 dp, cerca de 9 mm [F38, F39] | 48px | Nada |
| NN/g, idosos | Erro claro e fácil de corrigir [F32]; evitar termos técnicos [F34]; menu suspenso e controle deslizante são difíceis [F36] | Textos do balcão; período do Resumo é escolhido por abas, sem menu suspenso | Varrer textos e erros; não usar `<select>` nem slider |
| Padrão Digital de Governo (gov.br) 4.0 | Componentes com usabilidade e acessibilidade embutidas; quem usa serviços do governo já reconhece os padrões [F37] | Design próprio | Não copiar o visual; só vale como referência de padrão conhecido (por exemplo, a entrada com conta gov.br que o MEI já usa para emitir o DAS é **[hipótese]** a considerar) |
| Voz em português | Whisper grande é o mais preciso nos testes, mas pede revisão; sotaque, ruído e fala sobreposta aumentam erros [F40]; modelos pequenos locais inventam texto [F41] | Whisper large-v3-turbo por API, sempre com revisão antes de enviar | Manter a revisão; testar com sotaque nordestino e barulho de rua |

Não achei estudo sobre reconhecimento de fala com pessoas idosas falando português brasileiro.

## Concorrentes e referências olhados

| App | Tipo | O que se elogia | O que se reclama | Lição para a MEIva |
| --- | --- | --- | --- | --- |
| Kyte | Vendas e estoque para loja | Fácil, interface simples, suporte bom em um caso [F16] | Cobrança depois do teste, preço que muda, renovação não reconhecida, bug de estoque, crediário difícil [F16, F17]; relatório de vendas parado [F18] | Preço claro desde o começo; o relatório tem que bater sempre |
| InfinitePay | Maquininha e conta | Boa reputação geral: nota 9,7 e 98,1% de resolução [F19] | Não conseguir entrar, troca de celular, falta de humano [F20] | O acesso é a parte mais frágil; ter saída humana |
| Mobills | Finanças pessoais | Funcional para quem usa há anos [F25] | Recurso que passa a ser pago; sincronização e categoria sumida [F25, F26] | Não tirar o que já era grátis |
| Organizze | Finanças pessoais | Simples, leve, bonito; usuário prefere lançar à mão a apps automáticos [F27, F28] | Pedem mais categorias [F28] | Lançamento manual simples tem público |
| Caderneta | Fiado | (só descrição) cobrança pronta no WhatsApp com Pix, vencidos do dia [F21] | Não lido | Cobrança e vencimento são o padrão do nicho |
| Caderno do MEI | Fiado e vendas | (só descrição) sem internet, sem cadastro, cobrança gentil [F22] | Poucas avaliações para concluir [F22] | Zero cadastro como argumento |
| Quita | Fiado | (só descrição) quitar tudo de uma vez, lixeira [F23] | Não lido | Recuperar o que foi apagado passa confiança |
| CadêFiado | Fiado | (só descrição) alertas de vencido e a vencer [F24] | Não lido | Alerta de vencimento |

Limite desta parte: das lojas de apps só aparecem poucas avaliações por página (10 de cerca de 3,5 mil no Kyte), e nos apps de fiado só li a descrição feita pelo próprio desenvolvedor. Servem para achar padrões, não para medir frequência.
