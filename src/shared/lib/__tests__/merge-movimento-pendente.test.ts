import { mergeMovimentoPendente } from '../merge-movimento-pendente';
import type { MovimentoCapturado } from '@/shared/types';

const base: MovimentoCapturado = {
  id: '1',
  instituicao: 'nubank',
  tipo: 'gasto',
  valor: 10,
  descricao: 'teste',
  rawKey: 'key-a',
  capturadoEm: '2026-07-18T00:00:00.000Z',
  status: 'pendente',
};

describe('mergeMovimentoPendente', () => {
  it('adiciona_item_novo_no_inicio', () => {
    const r = mergeMovimentoPendente([], base);
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe('1');
  });

  it('deduplica_pelo_rawKey', () => {
    const r = mergeMovimentoPendente([base], { ...base, id: '2' });
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe('1');
  });
});
