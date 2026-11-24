/**
 * Casamento aproximado de nomes de clientes ("Dona Maria", "maria", "Maria"
 * são a mesma pessoa). Função pura, usada no "a receber" e nas ferramentas.
 */

const TRATAMENTOS = new Set(["dona", "dna", "seu", "sr", "sra", "srta", "senhor", "senhora", "d"]);

/** "Dona Mária " -> "maria". Sem acento, minúsculas, sem pronome de tratamento. */
export function normalizarPessoa(nome: string): string {
  const tokens = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const semTratamento = tokens.filter((t) => !TRATAMENTOS.has(t));
  // "Seu" sozinho (ou só tratamentos) não pode virar string vazia.
  return (semTratamento.length > 0 ? semTratamento : tokens).join(" ");
}

/** Distância de edição limitada (para tolerar 1 letra errada em nomes). */
function distancia(a: string, b: string): number {
  const linha = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let anterior = linha[0];
    linha[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const atual = linha[j];
      linha[j] = Math.min(linha[j] + 1, linha[j - 1] + 1, anterior + (a[i - 1] === b[j - 1] ? 0 : 1));
      anterior = atual;
    }
  }
  return linha[b.length];
}

function tokenCasa(consulta: string, nome: string): boolean {
  if (consulta === nome) return true;
  if (consulta.length >= 3 && nome.startsWith(consulta)) return true;
  return consulta.length >= 4 && nome.length >= 4 && distancia(consulta, nome) <= 1;
}

/**
 * A consulta casa com o nome quando cada palavra da consulta casa com alguma
 * palavra do nome: "maria" casa "maria silva"; "maria silva" não casa "maria souza".
 * Ambos já normalizados.
 */
export function pessoaCasa(consulta: string, nome: string): boolean {
  if (!consulta || !nome) return false;
  if (consulta === nome) return true;
  const tokensNome = nome.split(" ");
  return consulta.split(" ").every((c) => tokensNome.some((n) => tokenCasa(c, n)));
}
