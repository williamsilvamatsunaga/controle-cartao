import type { MovimentoCapturado } from '@/shared/types';

export function mergeMovimentoPendente(
  lista: MovimentoCapturado[],
  item: MovimentoCapturado,
): MovimentoCapturado[] {
  if (lista.some((m) => m.rawKey === item.rawKey)) return lista;
  return [item, ...lista];
}
