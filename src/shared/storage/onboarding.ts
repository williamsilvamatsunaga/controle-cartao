import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CHAVE_COMPRAS,
  CHAVE_EXTRATOS,
  CHAVE_HISTORICO,
  CHAVE_MOVIMENTOS_PENDENTES,
  CHAVE_PERFIL,
  CHAVE_PRIMEIRA_VEZ,
} from './keys';

export async function verificarPrimeiraVez(): Promise<boolean> {
  try {
    const valor = await AsyncStorage.getItem(CHAVE_PRIMEIRA_VEZ);
    return valor === null;
  } catch {
    return true;
  }
}

export async function marcarPrimeiraVezConcluida(): Promise<void> {
  await AsyncStorage.setItem(CHAVE_PRIMEIRA_VEZ, 'false');
}

/** Apaga perfil, compras, histórico, onboarding, extratos e fila — volta ao fluxo inicial. */
export async function limparTudo(): Promise<void> {
  await AsyncStorage.multiRemove([
    CHAVE_PERFIL,
    CHAVE_COMPRAS,
    CHAVE_HISTORICO,
    CHAVE_PRIMEIRA_VEZ,
    CHAVE_MOVIMENTOS_PENDENTES,
    CHAVE_EXTRATOS,
  ]);
}
