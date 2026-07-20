import type { FluxoMensal, LancamentoPersistido } from '../types';

export function agregarFluxoMes(
  lancamentos: LancamentoPersistido[],
  mes: string
): FluxoMensal {
  const doMes = lancamentos.filter((l) => l.mes === mes);
  let entradas = 0;
  let saidas = 0;
  let saidasCartao = 0;
  let rendaExtrato = 0;

  for (const l of doMes) {
    if (l.tipo === 'credito') {
      entradas += l.valor;
      if (l.natureza === 'renda') rendaExtrato += l.valor;
    } else {
      saidas += l.valor;
      if (l.natureza === 'cartao') saidasCartao += l.valor;
    }
  }

  return {
    mes,
    entradas,
    saidas,
    saldo: entradas - saidas,
    saidasCartao,
    rendaExtrato,
  };
}

export function listarMesesComLancamentos(lancamentos: LancamentoPersistido[]): string[] {
  return [...new Set(lancamentos.map((l) => l.mes))].sort();
}
