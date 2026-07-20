import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Compra, FaturaHistorico, PerfilFinanceiro } from '@/shared/types';
import {
  calcularComprometimentoNoMes,
  calcularRendaDisponivel,
  compraIncideNoMes,
} from '@/shared/lib/calculos';
import { salvarCompras } from './compras';
import { salvarPerfil } from './perfil';
import { CHAVE_HISTORICO } from './keys';

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

  const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1)
    .toISOString()
    .slice(0, 7);
  const comprasAtivas = compras.filter((c) => compraIncideNoMes(c, proximoMes));
  await salvarCompras(comprasAtivas);

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
