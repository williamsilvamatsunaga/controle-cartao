import type { LancamentoExtrato, NaturezaLancamento } from '../types';

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

const PADROES_CARTAO = [
  'fatura',
  'cartao',
  'cartao de credito',
  'credito',
  'visa',
  'master',
  'mastercard',
  'elo',
  'amex',
  'american express',
  'parcela',
  'parcelamento',
  'anuidade',
  'pagamento cartao',
  'pgto cartao',
  'invoice',
];

const PADROES_RENDA = [
  'salario',
  'folha',
  'vencimento',
  'pagamento de salario',
  'proventos',
  'holerite',
  'adiantamento salarial',
];

export function sugerirNatureza(lancamento: LancamentoExtrato): NaturezaLancamento {
  const d = normalizar(lancamento.descricao);

  if (lancamento.tipo === 'debito' && PADROES_CARTAO.some((p) => d.includes(p))) {
    return 'cartao';
  }

  if (
    lancamento.tipo === 'credito' &&
    PADROES_RENDA.some((p) => d.includes(p))
  ) {
    return 'renda';
  }

  return 'outro';
}
