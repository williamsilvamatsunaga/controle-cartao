import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Compra } from '@/shared/types';
import { CHAVE_COMPRAS } from './keys';

export async function salvarCompras(compras: Compra[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAVE_COMPRAS, JSON.stringify(compras));
  } catch (erro) {
    console.error('Erro ao salvar compras:', erro);
    throw erro;
  }
}

export async function carregarCompras(): Promise<Compra[]> {
  try {
    const json = await AsyncStorage.getItem(CHAVE_COMPRAS);
    return json ? JSON.parse(json) : [];
  } catch (erro) {
    console.error('Erro ao carregar compras:', erro);
    return [];
  }
}

export async function adicionarCompra(novaCompra: Compra): Promise<Compra[]> {
  const comprasAtuais = await carregarCompras();
  const comprasAtualizadas = [...comprasAtuais, novaCompra];
  await salvarCompras(comprasAtualizadas);
  return comprasAtualizadas;
}

export async function removerCompra(idCompra: string): Promise<Compra[]> {
  const comprasAtuais = await carregarCompras();
  const comprasAtualizadas = comprasAtuais.filter((c) => c.id !== idCompra);
  await salvarCompras(comprasAtualizadas);
  return comprasAtualizadas;
}
