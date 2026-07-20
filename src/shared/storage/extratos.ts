import AsyncStorage from '@react-native-async-storage/async-storage';

import { mergeLancamentos } from '@/features/extrato/lib/merge-lancamentos';
import type { LancamentoPersistido } from '@/features/extrato/types';

import { CHAVE_EXTRATOS } from './keys';

export interface ExtratoStore {
  lancamentos: LancamentoPersistido[];
  atualizadoEm: string;
}

export async function carregarExtratos(): Promise<LancamentoPersistido[]> {
  try {
    const json = await AsyncStorage.getItem(CHAVE_EXTRATOS);
    if (!json) return [];
    const store = JSON.parse(json) as ExtratoStore;
    return store.lancamentos ?? [];
  } catch {
    return [];
  }
}

export async function salvarExtratos(lancamentos: LancamentoPersistido[]): Promise<void> {
  const store: ExtratoStore = {
    lancamentos,
    atualizadoEm: new Date().toISOString(),
  };
  await AsyncStorage.setItem(CHAVE_EXTRATOS, JSON.stringify(store));
}

export async function mesclarLancamentosExtrato(
  novos: LancamentoPersistido[]
): Promise<LancamentoPersistido[]> {
  const atuais = await carregarExtratos();
  const mesclados = mergeLancamentos(atuais, novos);
  await salvarExtratos(mesclados);
  return mesclados;
}
