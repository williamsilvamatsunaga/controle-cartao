import { calcularComprometimentoHibrido } from '../comprometimento-hibrido';
import type { LancamentoPersistido } from '../../types';
import type { Compra } from '@/shared/types';

const compra: Compra = {
  id: 'c1',
  valor: 300,
  numeroParcelas: 3,
  categoria: 'Compras',
  dataCompra: '2026-01-01',
  parcelaMensal: 100,
};

const cartao: LancamentoPersistido = {
  id: 'e1',
  data: '2026-01-20',
  mes: '2026-01',
  descricao: 'FATURA',
  valor: 50,
  tipo: 'debito',
  natureza: 'cartao',
};

const pix: LancamentoPersistido = {
  id: 'e2',
  data: '2026-01-21',
  mes: '2026-01',
  descricao: 'PIX',
  valor: 200,
  tipo: 'debito',
  natureza: 'outro',
};

describe('calcularComprometimentoHibrido', () => {
  test('hibrido_parcelasMaisCartaoExtrato_soma', () => {
    expect(
      calcularComprometimentoHibrido([compra], [cartao, pix], '2026-01')
    ).toBe(150);
  });

  test('hibrido_semExtrato_soParcelas', () => {
    expect(calcularComprometimentoHibrido([compra], [], '2026-01')).toBe(100);
  });

  test('hibrido_semCompras_soCartao', () => {
    expect(calcularComprometimentoHibrido([], [cartao], '2026-01')).toBe(50);
  });
});
