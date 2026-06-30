import AsyncStorage from '@react-native-async-storage/async-storage';
import { Compra, PerfilFinanceiro } from '../types';

const CHAVE_PERFIL = '@controle_cartao:perfil';
const CHAVE_COMPRAS = '@controle_cartao:compras';

// ---------- PERFIL ----------

export async function salvarPerfil(perfil: PerfilFinanceiro): Promise<void> {
  try {
    const json = JSON.stringify(perfil);
    await AsyncStorage.setItem(CHAVE_PERFIL, json);
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

// ---------- COMPRAS ----------

export async function salvarCompras(compras: Compra[]): Promise<void> {
  try {
    const json = JSON.stringify(compras);
    await AsyncStorage.setItem(CHAVE_COMPRAS, json);
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

// ---------- UTILITÁRIO (apenas para testes/reset) ----------

export async function limparTudo(): Promise<void> {
  await AsyncStorage.multiRemove([CHAVE_PERFIL, CHAVE_COMPRAS]);
}