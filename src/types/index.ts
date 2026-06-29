export interface PerfilFinanceiro {
  salarioLiquido: number;
  outrasRendas: number;
  reservaEmergencia: number;
  investimentos: number;
}

export type Categoria =
  | 'Tecnologia'
  | 'Alimentação'
  | 'Vestuário'
  | 'Saúde'
  | 'Lazer'
  | 'Casa'
  | 'Outros';

export interface Compra {
  id: string;
  valor: number;
  numeroParcelas: number;
  categoria: Categoria;
  dataCompra: string; // formato ISO, ex: "2026-06-28"
  parcelaMensal: number; // calculado automaticamente ao salvar
}

export type ClassificacaoCompra = 'ok' | 'moderado' | 'atencao';

export interface ResultadoAnaliseCompra {
  parcelaMensal: number;
  comprometimentoAtual: number; // %
  comprometimentoApos: number; // %
  classificacao: ClassificacaoCompra;
}