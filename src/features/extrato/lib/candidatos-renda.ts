import type { CandidatoRenda, LancamentoExtrato } from '../types';

export interface OpcoesCandidatosRenda {
  /** Valor mínimo (R$) para um crédito ser considerado candidato a renda. */
  limiarMinimo?: number;
}

export function detectarCandidatosRenda(
  lancamentos: LancamentoExtrato[],
  opcoes: OpcoesCandidatosRenda = {}
): CandidatoRenda[] {
  const limiar = opcoes.limiarMinimo ?? 500;

  return lancamentos
    .filter((l) => l.tipo === 'credito' && l.valor >= limiar)
    .map((l, index) => ({
      ...l,
      id: `${l.data}-${index}-${l.valor}`,
    }));
}
