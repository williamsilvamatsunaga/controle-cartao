import { mergeLancamentos } from '../merge-lancamentos';
import type { LancamentoPersistido } from '../../types';

const a: LancamentoPersistido = {
  id: '1',
  data: '2026-01-05',
  mes: '2026-01',
  descricao: 'SALARIO',
  valor: 4500,
  tipo: 'credito',
  natureza: 'renda',
};

const b: LancamentoPersistido = {
  id: '2',
  data: '2026-01-06',
  mes: '2026-01',
  descricao: 'PIX MERCADO',
  valor: 80,
  tipo: 'debito',
  natureza: 'outro',
};

describe('mergeLancamentos', () => {
  test('merge_novosSemDuplicata_concatena', () => {
    expect(mergeLancamentos([a], [b])).toHaveLength(2);
  });

  test('merge_mesmoLancamento_naoDuplica', () => {
    const dup = { ...a, id: '99' };
    expect(mergeLancamentos([a], [dup])).toHaveLength(1);
  });

  test('merge_mesClaro_mantemAmbos', () => {
    const fev: LancamentoPersistido = {
      ...b,
      id: '3',
      data: '2026-02-06',
      mes: '2026-02',
    };
    expect(mergeLancamentos([a, b], [fev])).toHaveLength(3);
  });
});
