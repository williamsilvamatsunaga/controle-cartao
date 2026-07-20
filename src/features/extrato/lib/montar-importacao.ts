import type {
  ClassificacaoRenda,
  LancamentoExtrato,
  LancamentoPersistido,
  NaturezaLancamento,
  ResultadoImportacaoExtrato,
} from '../types';
import { agregarRendasValidadas } from './agregar-rendas';
import { sugerirNatureza } from './classificar-natureza';

export type RevisaoLancamento = LancamentoExtrato & {
  id: string;
  natureza: NaturezaLancamento;
  /** Só relevante se natureza=renda */
  tipoRenda?: 'salario' | 'outra_renda';
  origemArquivo?: string;
};

export function toPersistidos(revisoes: RevisaoLancamento[]): LancamentoPersistido[] {
  return revisoes
    .filter((r) => !(r.natureza === 'renda' && !r.tipoRenda))
    .map((r) => ({
      id: r.id,
      data: r.data,
      mes: r.data.slice(0, 7),
      descricao: r.descricao,
      valor: r.valor,
      tipo: r.tipo,
      natureza: r.natureza,
      origemArquivo: r.origemArquivo,
      tipoRenda: r.tipoRenda,
    }));
}

export function montarResultadoImportacao(
  revisoes: RevisaoLancamento[]
): ResultadoImportacaoExtrato {
  const rendaItens = revisoes
    .filter((r) => r.natureza === 'renda' && r.tipoRenda)
    .map((r) => ({
      id: r.id,
      data: r.data,
      descricao: r.descricao,
      valor: r.valor,
      tipo: r.tipo as 'credito',
      classificacao: r.tipoRenda as ClassificacaoRenda,
    }));

  return {
    renda: agregarRendasValidadas(rendaItens),
    lancamentos: toPersistidos(revisoes),
  };
}

export function criarRevisoesIniciais(
  lancamentos: LancamentoExtrato[],
  origemArquivo?: string
): RevisaoLancamento[] {
  return lancamentos.map((l, index) => {
    const natureza = sugerirNatureza(l);
    return {
      ...l,
      id: `${l.data}-${index}-${l.valor}-${l.tipo}`,
      natureza,
      tipoRenda: natureza === 'renda' ? 'salario' : undefined,
      origemArquivo,
    };
  });
}
