import { agregarFluxoMes, listarMesesComLancamentos } from '../agregar-fluxo-mes';
import type { LancamentoPersistido } from '../../types';

const lancamentos: LancamentoPersistido[] = [
  {
    id: '1',
    data: '2026-01-05',
    mes: '2026-01',
    descricao: 'SALARIO',
    valor: 4500,
    tipo: 'credito',
    natureza: 'renda',
  },
  {
    id: '2',
    data: '2026-01-10',
    mes: '2026-01',
    descricao: 'PIX',
    valor: 200,
    tipo: 'debito',
    natureza: 'outro',
  },
  {
    id: '3',
    data: '2026-01-15',
    mes: '2026-01',
    descricao: 'FATURA CARTAO',
    valor: 800,
    tipo: 'debito',
    natureza: 'cartao',
  },
  {
    id: '4',
    data: '2026-02-05',
    mes: '2026-02',
    descricao: 'SALARIO',
    valor: 4500,
    tipo: 'credito',
    natureza: 'renda',
  },
];

describe('agregarFluxoMes', () => {
  test('agregar_mesComEntradasESaidas_totaisCorretos', () => {
    expect(agregarFluxoMes(lancamentos, '2026-01')).toEqual({
      mes: '2026-01',
      entradas: 4500,
      saidas: 1000,
      saldo: 3500,
      saidasCartao: 800,
      rendaExtrato: 4500,
    });
  });

  test('agregar_mesSemDados_zeros', () => {
    expect(agregarFluxoMes(lancamentos, '2026-03')).toEqual({
      mes: '2026-03',
      entradas: 0,
      saidas: 0,
      saldo: 0,
      saidasCartao: 0,
      rendaExtrato: 0,
    });
  });
});

describe('listarMesesComLancamentos', () => {
  test('listar_retornaMesesOrdenados', () => {
    expect(listarMesesComLancamentos(lancamentos)).toEqual(['2026-01', '2026-02']);
  });
});
