import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { carregarCompras, carregarPerfil, fecharFatura, limparTudo, removerCompra } from '../storage/storage';
import { Categoria, Compra, PerfilFinanceiro } from '../types';
import {
  calcularComprometimentoNoMes,
  calcularRendaDisponivel, calcularRendaMediaFutura,
  compraIncideNoMes,
} from '../utils/calculos';

const CORES_CATEGORIA: Record<Categoria, string> = {
  'Mercado': '#22c55e',
  'Combustível': '#f97316',
  'Saúde': '#ef4444',
  'Contas': '#8b5cf6',
  'Moradia': '#3b82f6',
  'Educação': '#06b6d4',
  'Transporte': '#84cc16',
  'Academia': '#ec4899',
  'Internet': '#14b8a6',
  'Telefonia': '#6366f1',
  'Lazer': '#f59e0b',
  'Streaming': '#7c3aed',
  'Restaurantes': '#dc2626',
  'Compras': '#0ea5e9',
  'Games': '#10b981',
  'Presentes': '#f43f5e',
  'Outros': '#94a3b8',
};

function gerarProximosMeses(quantidade: number): string[] {
  const meses: string[] = [];
  const hoje = new Date();
  for (let i = 0; i < quantidade; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    meses.push(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`);
  }
  return meses;
}

function formatarMes(mesStr: string): string {
  const nomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const [ano, mes] = mesStr.split('-');
  return `${nomes[parseInt(mes) - 1]} ${ano}`;
}

function getCorPercentual(p: number): string {
  if (p <= 40) return '#16a34a';
  if (p <= 60) return '#d97706';
  return '#dc2626';
}

function deveFecharFatura(perfil: PerfilFinanceiro): boolean {
  const hoje = new Date();
  const diaHoje = hoje.getDate();

  if (diaHoje < perfil.diaFechamento) return false;
  if (!perfil.ultimoFechamento) return false; // nunca deve cair aqui agora

  const ultimoFech = new Date(perfil.ultimoFechamento);

  // Só mostra se o último fechamento foi em um mês anterior ao atual
  const mesAtual = hoje.getFullYear() * 12 + hoje.getMonth();
  const mesUltimoFech = ultimoFech.getFullYear() * 12 + ultimoFech.getMonth();

  return mesAtual > mesUltimoFech;
}

export default function Dashboard() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilFinanceiro | null>(null);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Fechamento de fatura
  const [mostraFormFechamento, setMostraFormFechamento] = useState(false);
  const [novoSalario, setNovoSalario] = useState('');
  const [novasOutrasRendas, setNovasOutrasRendas] = useState('');
  // Confirmação da compra
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState<string | null>(null);

  useEffect(() => { carregarDados(); }, []);

  async function carregarDados() {
    const [p, c] = await Promise.all([carregarPerfil(), carregarCompras()]);
    setPerfil(p);
    setCompras(c);
    setCarregando(false);
  }

  async function handleFecharFatura() {
    if (!perfil) return;

    const salNum = parseFloat(novoSalario.replace(',', '.'));
    const outNum = parseFloat(novasOutrasRendas.replace(',', '.'));

    const novosDados = novoSalario
      ? { salarioLiquido: isNaN(salNum) ? perfil.salarioLiquido : salNum,
          outrasRendas: isNaN(outNum) ? perfil.outrasRendas : outNum }
      : undefined;

    await fecharFatura(perfil, compras, novosDados);
    setMostraFormFechamento(false);
    setNovoSalario('');
    setNovasOutrasRendas('');
    carregarDados();
  }

  async function handleCancelarCompra(id: string) {
    await removerCompra(id);
    setConfirmandoCancelamento(null);
    carregarDados();
  }

  async function handleResetar() {
    await limparTudo();
    router.replace('/');
  }

  // async function handleResetar() {
  //   await limparTudo();
  //   router.replace('/cadastro-perfil');
  // }

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!perfil) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Perfil não encontrado.</Text>
        <TouchableOpacity onPress={() => router.replace('/cadastro-perfil')}>
          <Text style={{ color: '#2563eb', marginTop: 8 }}>Ir para cadastro</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rendaDisponivel = calcularRendaDisponivel(perfil);
  const mesAtual = new Date().toISOString().slice(0, 7);
  const comprometidoAtual = calcularComprometimentoNoMes(compras, mesAtual);
  const percentualAtual = rendaDisponivel > 0 ? (comprometidoAtual / rendaDisponivel) * 100 : 0;
  const proximosMeses = gerarProximosMeses(6);
  const precisaFechar = deveFecharFatura(perfil);

  // Gastos por categoria no mês atual
  const gastosPorCategoria = Object.entries(CORES_CATEGORIA)
    .map(([cat]) => {
      const total = compras
        .filter(c => c.categoria === cat && compraIncideNoMes(c, mesAtual))
        .reduce((sum, c) => sum + c.parcelaMensal, 0);
      return { categoria: cat as Categoria, total };
    })
    .filter(g => g.total > 0)
    .sort((a, b) => b.total - a.total);

  const maiorGasto = gastosPorCategoria[0]?.total || 1;

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Meu Cartão</Text>
        <TouchableOpacity style={styles.botaoNova} onPress={() => router.push('/nova-compra')}>
          <Text style={styles.botaoNovaTexto}>+ Nova compra</Text>
        </TouchableOpacity>
      </View>

      {/* Banner de fechamento de fatura */}
      {precisaFechar && (
        <View style={styles.bannerFechamento}>
          <Text style={styles.bannerTitulo}>
            🗓 Hoje é dia {perfil.diaFechamento} — hora de fechar a fatura!
          </Text>
          <Text style={styles.bannerSubtitulo}>
            A fatura será arquivada. As parcelas em andamento continuam no próximo mês.
          </Text>

          {mostraFormFechamento ? (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.bannerLabel}>Novo salário líquido (deixe em branco para manter)</Text>
              <TextInput
                style={styles.bannerInput}
                keyboardType="numeric"
                placeholder={`Atual: R$ ${perfil.salarioLiquido}`}
                value={novoSalario}
                onChangeText={setNovoSalario}
              />
              <Text style={styles.bannerLabel}>Outras rendas</Text>
              <TextInput
                style={styles.bannerInput}
                keyboardType="numeric"
                placeholder={`Atual: R$ ${perfil.outrasRendas}`}
                value={novasOutrasRendas}
                onChangeText={setNovasOutrasRendas}
              />
              <TouchableOpacity style={styles.bannerBotao} onPress={handleFecharFatura}>
                <Text style={styles.bannerBotaoTexto}>Confirmar fechamento</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMostraFormFechamento(false)}>
                <Text style={styles.bannerCancelar}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.bannerBotao}
              onPress={() => setMostraFormFechamento(true)}>
              <Text style={styles.bannerBotaoTexto}>Fechar fatura agora</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Card resumo */}
      <View style={styles.card}>
        <View style={styles.cardLinha}>
          <Text style={styles.cardLabel}>Renda disponível</Text>
          <Text style={styles.cardValor}>R$ {rendaDisponivel.toFixed(2)}</Text>
        </View>
        <View style={styles.cardLinha}>
          <Text style={styles.cardLabel}>Comprometido este mês</Text>
          <Text style={[styles.cardValor, { color: getCorPercentual(percentualAtual) }]}>
            R$ {comprometidoAtual.toFixed(2)}
          </Text>
        </View>

        {perfil.deducoesMensais > 0 && (
          <View style={styles.cardLinha}>
            <Text style={styles.cardLabel}>Reserva / Investimentos</Text>
            <Text style={styles.cardValor}>R$ {perfil.deducoesMensais.toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.barraContainer}>
          <View style={[styles.barra, {
            width: `${Math.min(percentualAtual, 100)}%`,
            backgroundColor: getCorPercentual(percentualAtual),
          }]} />
        </View>
        <Text style={[styles.percentualTexto, { color: getCorPercentual(percentualAtual) }]}>
          {percentualAtual.toFixed(1)}% da renda comprometida
        </Text>
      </View>

      {/* Calendário financeiro */}
      <Text style={styles.secaoTitulo}>Próximos meses</Text>
      <View style={styles.card}>
        {proximosMeses.map((mes, index) => {
          const valor = calcularComprometimentoNoMes(compras, mes);
          // Usa média de renda para meses futuros (além do atual)
          const renda = index === 0 ? rendaDisponivel : calcularRendaMediaFutura(perfil);
          const percentual = renda > 0 ? (valor / renda) * 100 : 0;
          return (
            <View key={mes} style={[styles.mesLinha, index < proximosMeses.length - 1 && styles.mesLinhaBorda]}>
              <Text style={styles.mesNome}>{formatarMes(mes)}</Text>
              <View style={styles.mesDireita}>
                <Text style={[styles.mesValor, { color: getCorPercentual(percentual) }]}>
                  R$ {valor.toFixed(2)}
                </Text>
                <Text style={[styles.mesPercentual, { color: getCorPercentual(percentual) }]}>
                  {percentual.toFixed(1)}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Gastos por categoria */}
      {gastosPorCategoria.length > 0 && (
        <>
          <Text style={styles.secaoTitulo}>Gastos por categoria este mês</Text>
          <View style={styles.card}>

            {/* Barra empilhada */}
            <View style={styles.barraEmpilhadaContainer}>
              {gastosPorCategoria.map((g) => {
                const largura = (g.total / comprometidoAtual) * 100;
                return (
                  <View
                    key={g.categoria}
                    style={[
                      styles.barraEmpilhadaSegmento,
                      {
                        width: `${largura}%`,
                        backgroundColor: CORES_CATEGORIA[g.categoria],
                      },
                    ]}
                  />
                );
              })}
            </View>

            {/* Legenda em grade */}
            <View style={styles.legendaGrid}>
              {gastosPorCategoria.map((g) => (
                <View key={g.categoria} style={styles.legendaItem}>
                  <View style={styles.legendaEsquerda}>
                    <View style={[styles.legendaCirculo, { backgroundColor: CORES_CATEGORIA[g.categoria] }]} />
                    <Text style={styles.legendaNome} numberOfLines={1} ellipsizeMode="tail">
                      {g.categoria}
                    </Text>
                  </View>
                  <Text style={[styles.legendaValor, { color: CORES_CATEGORIA[g.categoria] }]}>
                    R$ {g.total.toFixed(0)}
                  </Text>
                </View>
              ))}
            </View>

          </View>
        </>
      )}

      {/* Lista de compras */}
      <Text style={styles.secaoTitulo}>Compras registradas</Text>
      <View style={styles.card}>
        {compras.length === 0 ? (
          <Text style={styles.semCompras}>Nenhuma compra registrada ainda.</Text>
        ) : (
          compras.map((compra, index) => (
            <View key={compra.id} style={[
              styles.compraLinha,
              index < compras.length - 1 && styles.mesLinhaBorda,
            ]}>
              <View style={styles.compraEsquerda}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.categoriaCirculo, { backgroundColor: CORES_CATEGORIA[compra.categoria] }]} />
                  <Text style={styles.compraCategoria}>{compra.categoria}</Text>
                </View>
                <Text style={styles.compraData}>
                  {compra.numeroParcelas}x de R$ {compra.parcelaMensal.toFixed(2)}
                </Text>
              </View>

              <View style={styles.compraDireita}>
                <Text style={styles.compraValor}>R$ {compra.valor.toFixed(2)}</Text>

                {confirmandoCancelamento === compra.id ? (
                  <View style={styles.confirmacaoContainer}>
                    <Text style={styles.confirmacaoTexto}>Cancelar compra?</Text>
                    <View style={styles.confirmacaoBotoes}>
                      <Pressable
                        style={styles.botaoConfirmarSim}
                        onPress={() => handleCancelarCompra(compra.id)}>
                        <Text style={styles.botaoConfirmarSimTexto}>Sim</Text>
                      </Pressable>
                      <Pressable
                        style={styles.botaoConfirmarNao}
                        onPress={() => setConfirmandoCancelamento(null)}>
                        <Text style={styles.botaoConfirmarNaoTexto}>Não</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    style={styles.botaoCancelarCompra}
                    onPress={() => setConfirmandoCancelamento(compra.id)}>
                    <Text style={styles.botaoCancelarCompraTexto}>Cancelar</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Ações */}
      <TouchableOpacity style={styles.botaoHistorico} onPress={() => router.push('/historico')}>
        <Text style={styles.botaoHistoricoTexto}>📋 Ver histórico de faturas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoResetar} onPress={handleResetar}>
        <Text style={styles.botaoResetarTexto}>🔄 Recomeçar do zero</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 24, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold' },
  botaoNova: { backgroundColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  botaoNovaTexto: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  bannerFechamento: {
    backgroundColor: '#fefce8', borderRadius: 12, borderWidth: 1,
    borderColor: '#fde047', padding: 16, marginBottom: 16,
  },
  bannerTitulo: { fontSize: 15, fontWeight: 'bold', color: '#854d0e', marginBottom: 4 },
  bannerSubtitulo: { fontSize: 13, color: '#92400e', marginBottom: 12 },
  bannerLabel: { fontSize: 13, fontWeight: '600', color: '#78350f', marginBottom: 4, marginTop: 8 },
  bannerInput: {
    borderWidth: 1, borderColor: '#fde047', borderRadius: 8,
    padding: 10, fontSize: 15, backgroundColor: '#fff',
  },
  bannerBotao: {
    backgroundColor: '#d97706', padding: 12, borderRadius: 8,
    alignItems: 'center', marginTop: 12,
  },
  bannerBotaoTexto: { color: '#fff', fontWeight: 'bold' },
  bannerCancelar: { color: '#92400e', textAlign: 'center', marginTop: 10, fontSize: 13 },
  card: {
    backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1,
    borderColor: '#e2e8f0', padding: 16, marginBottom: 16,
  },
  cardLinha: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardLabel: { fontSize: 14, color: '#555' },
  cardValor: { fontSize: 14, fontWeight: 'bold' },
  barraContainer: {
    height: 10, backgroundColor: '#e2e8f0', borderRadius: 5,
    overflow: 'hidden', marginVertical: 12,
  },
  barra: { height: '100%', borderRadius: 5 },
  percentualTexto: { fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  secaoTitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  mesLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  mesLinhaBorda: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  mesNome: { fontSize: 14, color: '#333' },
  mesDireita: { alignItems: 'flex-end' },
  mesValor: { fontSize: 14, fontWeight: 'bold' },
  mesPercentual: { fontSize: 12 },
  categoriaLinha: { paddingVertical: 10 },
  categoriaEsquerda: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  categoriaCirculo: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  categoriaNome: { fontSize: 14, fontWeight: '600', color: '#333' },
  categoriaDireita: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoriaBarra: {
    flex: 1, height: 8, backgroundColor: '#e2e8f0',
    borderRadius: 4, overflow: 'hidden',
  },
  categoriaBarraFill: { height: '100%', borderRadius: 4 },
  categoriaValor: { fontSize: 13, fontWeight: 'bold', minWidth: 80, textAlign: 'right' },
  semCompras: { color: '#999', textAlign: 'center', paddingVertical: 8 },
  compraLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  compraEsquerda: {},
  compraCategoria: { fontSize: 14, fontWeight: '600' },
  compraData: { fontSize: 12, color: '#666', marginTop: 2 },
  compraValor: { fontSize: 14, fontWeight: 'bold' },
  botaoHistorico: {
    padding: 14, borderRadius: 8, borderWidth: 1,
    borderColor: '#2563eb', alignItems: 'center', marginBottom: 12,
  },
  botaoHistoricoTexto: { color: '#2563eb', fontSize: 14, fontWeight: '600' },
  botaoResetar: {
    padding: 14, borderRadius: 8, borderWidth: 1,
    borderColor: '#dc2626', alignItems: 'center',
  },
  botaoResetarTexto: { color: '#dc2626', fontSize: 14 },

  barraEmpilhadaContainer: {
  flexDirection: 'row',
  height: 20,
  borderRadius: 10,
  overflow: 'hidden',
  marginBottom: 20,
  },
  barraEmpilhadaSegmento: {
    height: '100%',
  },
  legendaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendaItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  legendaEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 4,
  },
  legendaCirculo: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
    flexShrink: 0,
  },
  legendaNome: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  legendaValor: {
    fontSize: 12,
    fontWeight: 'bold',
    flexShrink: 0,
  },

  compraDireita: {
  alignItems: 'flex-end',
  gap: 6,
  },
  botaoCancelarCompra: {
    backgroundColor: '#fee2e2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  botaoCancelarCompraTexto: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },

  confirmacaoContainer: {
  alignItems: 'flex-end',
  gap: 6,
  },
  confirmacaoTexto: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  confirmacaoBotoes: {
    flexDirection: 'row',
    gap: 6,
  },
  botaoConfirmarSim: {
    backgroundColor: '#dc2626',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  botaoConfirmarSimTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  botaoConfirmarNao: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  botaoConfirmarNaoTexto: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
  },
});