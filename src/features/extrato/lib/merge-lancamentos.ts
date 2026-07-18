import type { LancamentoPersistido } from '../types';

export function chaveLancamento(
  l: Pick<LancamentoPersistido, 'data' | 'descricao' | 'valor' | 'tipo'>
): string {
  return `${l.data}|${l.descricao}|${l.valor}|${l.tipo}`;
}

/** Mescla novos lançamentos sem duplicar a mesma chave. */
export function mergeLancamentos(
  existentes: LancamentoPersistido[],
  novos: LancamentoPersistido[]
): LancamentoPersistido[] {
  const mapa = new Map<string, LancamentoPersistido>();
  for (const l of existentes) {
    mapa.set(chaveLancamento(l), l);
  }
  for (const l of novos) {
    const key = chaveLancamento(l);
    if (!mapa.has(key)) {
      mapa.set(key, l);
    }
  }
  return [...mapa.values()].sort((a, b) => a.data.localeCompare(b.data));
}
