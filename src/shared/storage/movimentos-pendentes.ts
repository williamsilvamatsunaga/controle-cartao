import AsyncStorage from '@react-native-async-storage/async-storage';
import { mergeMovimentoPendente } from '@/shared/lib/merge-movimento-pendente';
import type { MovimentoCapturado } from '@/shared/types';
import { CHAVE_MOVIMENTOS_PENDENTES } from './keys';

async function carregarTodosMovimentos(): Promise<MovimentoCapturado[]> {
  try {
    const json = await AsyncStorage.getItem(CHAVE_MOVIMENTOS_PENDENTES);
    if (!json) return [];
    return JSON.parse(json) as MovimentoCapturado[];
  } catch {
    return [];
  }
}

async function salvarLista(lista: MovimentoCapturado[]): Promise<void> {
  await AsyncStorage.setItem(CHAVE_MOVIMENTOS_PENDENTES, JSON.stringify(lista));
}

export async function carregarMovimentosPendentes(): Promise<MovimentoCapturado[]> {
  const lista = await carregarTodosMovimentos();
  return lista.filter((m) => m.status === 'pendente');
}

export async function enfileirarMovimento(
  parcial: Omit<MovimentoCapturado, 'id' | 'status'>,
): Promise<MovimentoCapturado | null> {
  const atuais = await carregarTodosMovimentos();
  if (atuais.some((m) => m.rawKey === parcial.rawKey)) return null;

  const item: MovimentoCapturado = {
    ...parcial,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: 'pendente',
  };
  await salvarLista(mergeMovimentoPendente(atuais, item));
  return item;
}

export async function buscarMovimentoPorId(
  id: string,
): Promise<MovimentoCapturado | null> {
  const lista = await carregarTodosMovimentos();
  return lista.find((m) => m.id === id) ?? null;
}

export async function atualizarStatusMovimento(
  id: string,
  status: MovimentoCapturado['status'],
): Promise<void> {
  const lista = await carregarTodosMovimentos();
  await salvarLista(lista.map((m) => (m.id === id ? { ...m, status } : m)));
}

export async function removerMovimento(id: string): Promise<void> {
  const lista = await carregarTodosMovimentos();
  await salvarLista(lista.filter((m) => m.id !== id));
}

export async function contarPendentes(): Promise<number> {
  return (await carregarMovimentosPendentes()).length;
}
