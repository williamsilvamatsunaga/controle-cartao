export type TipoLancamento = 'credito' | 'debito';

export type ClassificacaoRenda = 'salario' | 'outra_renda' | 'ignorar';

/** Como o lançamento alimenta o app após revisão do usuário. */
export type NaturezaLancamento = 'renda' | 'cartao' | 'outro';

export interface LancamentoExtrato {
  data: string; // YYYY-MM-DD
  descricao: string;
  valor: number; // sempre positivo
  tipo: TipoLancamento;
}

export interface CandidatoRenda extends LancamentoExtrato {
  id: string;
}

export interface CandidatoRendaClassificado extends CandidatoRenda {
  classificacao: ClassificacaoRenda;
}

export interface LancamentoPersistido extends LancamentoExtrato {
  id: string;
  mes: string; // YYYY-MM
  natureza: NaturezaLancamento;
  origemArquivo?: string;
  /** Se natureza=renda: salário vs outra (opcional). */
  tipoRenda?: 'salario' | 'outra_renda';
}

export interface FluxoMensal {
  mes: string;
  entradas: number;
  saidas: number;
  saldo: number;
  saidasCartao: number;
  rendaExtrato: number;
}

export interface RendaAgregadaDeExtrato {
  salarioLiquido: number;
  outrasRendas: number;
  historicoRendas: { mes: string; total: number }[];
}

export interface ResultadoImportacaoExtrato {
  renda: RendaAgregadaDeExtrato;
  lancamentos: LancamentoPersistido[];
}

export interface ArquivoExtratoMeta {
  nome: string;
  uri: string;
  mimeType?: string | null;
}
