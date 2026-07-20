import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PerfilFinanceiro } from '@/shared/types';
import { CHAVE_PERFIL } from './keys';

export async function salvarPerfil(perfil: PerfilFinanceiro): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAVE_PERFIL, JSON.stringify(perfil));
  } catch (erro) {
    console.error('Erro ao salvar perfil:', erro);
    throw erro;
  }
}

export async function carregarPerfil(): Promise<PerfilFinanceiro | null> {
  try {
    const json = await AsyncStorage.getItem(CHAVE_PERFIL);
    return json ? JSON.parse(json) : null;
  } catch (erro) {
    console.error('Erro ao carregar perfil:', erro);
    return null;
  }
}
