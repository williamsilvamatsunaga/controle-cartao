import AsyncStorage from '@react-native-async-storage/async-storage';
import { Compra, FaturaHistorico, PerfilFinanceiro } from '../types';
import { calcularComprometimentoNoMes, calcularRendaDisponivel, compraIncideNoMes } from '../utils/calculos';

const CHAVE_PERFIL = '@controle_cartao:perfil';
const CHAVE_COMPRAS = '@controle_cartao:compras';
const CHAVE_HISTORICO = '@controle_cartao:historico';

//

const CHAVE_PRIMEIRA_VEZ = '@controle_cartao:primeiraVez';

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

//

// PERFIL
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

// COMPRAS
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

// HISTÓRICO
export async function carregarHistorico(): Promise<FaturaHistorico[]> {
  try {
    const json = await AsyncStorage.getItem(CHAVE_HISTORICO);
    return json ? JSON.parse(json) : [];
  } catch (erro) {
    console.error('Erro ao carregar histórico:', erro);
    return [];
  }
}

export async function fecharFatura(
  perfil: PerfilFinanceiro,
  compras: Compra[],
  novoSalario?: { salarioLiquido: number; outrasRendas: number }
): Promise<void> {
  const hoje = new Date();
  const mes = hoje.toISOString().slice(0, 7);
  const rendaDisponivel = calcularRendaDisponivel(perfil);
  const totalComprometido = calcularComprometimentoNoMes(compras, mes);

  // Snapshot da fatura atual
  const fatura: FaturaHistorico = {
    id: Date.now().toString(),
    mes,
    compras: [...compras],
    rendaDisponivel,
    totalComprometido,
    percentualComprometido: rendaDisponivel > 0 ? (totalComprometido / rendaDisponivel) * 100 : 0,
    fechadaEm: hoje.toISOString(),
  };

  const historico = await carregarHistorico();
  await AsyncStorage.setItem(CHAVE_HISTORICO, JSON.stringify([...historico, fatura]));

  // Mantém apenas compras com parcelas ainda ativas no próximo mês
  const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1)
    .toISOString().slice(0, 7);
  const comprasAtivas = compras.filter(c => compraIncideNoMes(c, proximoMes));
  await salvarCompras(comprasAtivas);

  // Atualiza perfil com novo salário (se informado) e registra no histórico de rendas
  const rendaTotal = novoSalario
    ? novoSalario.salarioLiquido + novoSalario.outrasRendas
    : perfil.salarioLiquido + perfil.outrasRendas;

  const perfilAtualizado: PerfilFinanceiro = {
    ...perfil,
    ...(novoSalario || {}),
    ultimoFechamento: hoje.toISOString().slice(0, 10),
    historicoRendas: [...perfil.historicoRendas, { mes, total: rendaTotal }],
  };
  await salvarPerfil(perfilAtualizado);
}

export async function limparTudo(): Promise<void> {
  await AsyncStorage.multiRemove([
    CHAVE_PERFIL,
    CHAVE_COMPRAS,
    CHAVE_HISTORICO,
    CHAVE_PRIMEIRA_VEZ,
  ]);
}