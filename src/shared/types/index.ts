export type Categoria =
  | 'Mercado'
  | 'Combustível'
  | 'Saúde'
  | 'Contas'
  | 'Moradia'
  | 'Educação'
  | 'Transporte'
  | 'Academia'
  | 'Internet'
  | 'Telefonia'
  | 'Lazer'
  | 'Streaming'
  | 'Restaurantes'
  | 'Compras'
  | 'Games'
  | 'Presentes'
  | 'Outros';

export interface RendaMensal {
  mes: string; // "YYYY-MM"
  total: number; // salarioLiquido + outrasRendas
}

export interface PerfilFinanceiro {
  salarioLiquido: number;
  outrasRendas: number;
  deducoesMensais: number; // reserva + investimentos unificados
  diaFechamento: number;
  ultimoFechamento: string | null;
  historicoRendas: RendaMensal[];
}

export interface Compra {
  id: string;
  valor: number;
  numeroParcelas: number;
  categoria: Categoria;
  dataCompra: string;
  parcelaMensal: number;
}

export type ClassificacaoCompra = 'ok' | 'moderado' | 'atencao';

export interface ResultadoAnaliseCompra {
  parcelaMensal: number;
  comprometimentoAtual: number;
  comprometimentoApos: number;
  classificacao: ClassificacaoCompra;
}

export interface FaturaHistorico {
  id: string;
  mes: string;
  compras: Compra[];
  rendaDisponivel: number;
  totalComprometido: number;
  percentualComprometido: number;
  fechadaEm: string;
}

export type InstituicaoBancaria = 'nubank' | 'inter' | 'sicoob';
export type TipoMovimentoBancario = 'gasto' | 'recebimento' | 'ignorado';

export interface MovimentoCapturado {
  id: string;
  instituicao: InstituicaoBancaria;
  tipo: Exclude<TipoMovimentoBancario, 'ignorado'>;
  valor: number;
  descricao: string;
  rawKey: string;
  capturadoEm: string;
  status: 'pendente' | 'confirmado' | 'descartado';
}
